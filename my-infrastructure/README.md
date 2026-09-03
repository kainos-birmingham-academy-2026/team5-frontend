# Infrastructure

Terraform for the Team 5 Azure resources. One root module, one state file per
environment. Only `dev` exists today.

## Layout

| Path                   | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `main.tf`              | Root module, naming/tag locals, partial backend declaration |
| `variables.tf`         | Inputs (`project`, `environment`, `location`, `tags`)       |
| `backends/<env>.hcl`   | Remote state settings for that environment                  |
| `environments/<env>.tfvars` | Variable values for that environment                   |
| `modules/`             | Reusable resource modules                                   |
| `scripts/bootstrap-remote-state.sh` | One-off creation of the state storage account  |

Resources are named `<type>-<project>-<environment>`, e.g. `rg-jaleel-team5-dev`.

## Key Vault

`modules/key-vault` creates an empty vault (`kv-<project>-<environment>`).
Secret **values are not defined in Terraform**, tfvars, or application code.

After apply:

1. Open the vault in the Azure portal.
2. Create secrets there (for example `SESSION-SECRET`, `API-BASE-URL`).
3. Attach the user-assigned identity (`id-<project>-<environment>`) to the Container App, then reference each secret on the app:

   `@Microsoft.KeyVault(SecretUri=https://<vault>.vault.azure.net/secrets/<secret-name>)`

Key Vault role assignments are managed manually because the Terraform service
principal does not have permission to administer Azure RBAC. Grant the CI
service principal **Key Vault Secrets Officer** on the environment resource
group:

```bash
az role assignment create \
  --assignee-object-id "<terraform-sp-object-id>" \
  --assignee-principal-type ServicePrincipal \
  --role "Key Vault Secrets Officer" \
  --scope "/subscriptions/<subscription-id>/resourceGroups/rg-<project>-<environment>"
```

Azure has no built-in role named `Key Vault Secret Administrator`; **Key Vault
Secrets Officer** is the secrets-management role. Assign **Key Vault
Administrator** manually to teammates who need full portal access.

## User-assigned managed identity

`modules/user-assigned-identity` creates `id-<project>-<environment>` for Container Apps.
Grant it **Key Vault Secrets User** on the vault after the identity and vault
exist:

```bash
IDENTITY_OBJECT_ID="$(az identity show \
  --name "id-<project>-<environment>" \
  --resource-group "rg-<project>-<environment>" \
  --query principalId -o tsv)"
KEY_VAULT_ID="$(az keyvault show \
  --name "kv-<project>-<environment>" \
  --resource-group "rg-<project>-<environment>" \
  --query id -o tsv)"

az role assignment create \
  --assignee-object-id "$IDENTITY_OBJECT_ID" \
  --assignee-principal-type ServicePrincipal \
  --role "Key Vault Secrets User" \
  --scope "$KEY_VAULT_ID"
```

The identity is also granted **AcrPull** on the existing shared registry (`acraiacademy26` in `rg-ai-academy-26`). That registry is **looked up**, not created — CI already pushes `team5-frontend` there (`secrets.ACR_LOGIN_SERVER`).

Set `container_registry_name` and `container_registry_resource_group_name` in the environment tfvars.

## Container Apps environment

`modules/container-apps-environment` creates the shared platform:

- Log Analytics workspace `log-<project>-<environment>`
- Container Apps environment `cae-<project>-<environment>`

Later Container Apps (frontend, backend) attach to this environment.

## Container Apps

`modules/container-app` is used twice:

| App | Name | Ingress | Image |
| --- | --- | --- | --- |
| Frontend | `ca-frontend-<project>-<environment>` | **external** (public) | `acraiacademy26.azurecr.io/team5-frontend:latest` |
| Backend | `ca-backend-<project>-<environment>` | **internal** only | `acraiacademy26.azurecr.io/team5-backend:latest` |

Both apps use the user-assigned identity to pull from ACR. The frontend gets `API_BASE_URL` from the backend's internal URL. `SESSION_SECRET` is read from Key Vault secret `SESSION-SECRET` — create that secret in the portal **before** apply, or the frontend revision will fail.

Add backend secrets (for example a database URL) with `backend_secret_env` in tfvars; do not put secret values in Terraform.

## Running locally

```bash
az login
export ARM_SUBSCRIPTION_ID="$(az account show --query id -o tsv)"

cd my-infrastructure
terraform init -backend-config=backends/dev.hcl
terraform plan  -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

Switching between environments changes the backend key, so re-run
`terraform init -reconfigure -backend-config=backends/<env>.hcl` first.

### One-off migration from the old single-environment state

State used to live at `team5/infrastructure.tfstate` with the resource group
named `jaleel-infrastructure`. Copy the blob to the dev key before the first
pipeline run, otherwise dev starts from an empty state:

```bash
az storage blob copy start \
  --account-name jaleelteam5state \
  --destination-container tfstate \
  --destination-blob team5/dev/infrastructure.tfstate \
  --source-container tfstate \
  --source-blob team5/infrastructure.tfstate
```

The first plan then shows the resource group being replaced, because the name
now follows the convention (`rg-jaleel-team5-dev`).

## Pipeline

[.github/workflows/terraform.yml](../.github/workflows/terraform.yml) runs on any
change under `my-infrastructure/`:

- every branch and pull request: `fmt -check`, `init`, `validate`, `plan`
- `main` only: `apply -auto-approve` of the plan that was just produced

`TF_INPUT=false` and `TF_IN_AUTOMATION=true` keep it non-interactive, and a
`concurrency` group serialises runs so they do not fight over the state lock.

### Service principal

The workflow authenticates with a service principal via repository secrets
`ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_TENANT_ID`, `ARM_SUBSCRIPTION_ID`:

```bash
az ad sp create-for-rbac \
  --name sp-team5-terraform-dev \
  --role Contributor \
  --scopes /subscriptions/<subscription-id>
```

The principal also needs `Storage Blob Data Contributor` on the state storage
account. To move to federated credentials instead of a secret, add
`permissions: id-token: write`, set `ARM_USE_OIDC: true`, and drop
`ARM_CLIENT_SECRET`.

## Adding prod

1. `cp backends/dev.hcl backends/prod.hcl` and change `key` to `team5/prod/infrastructure.tfstate`.
2. `cp environments/dev.tfvars environments/prod.tfvars` and set `environment = "prod"`.
3. Add `prod` to the `workflow_dispatch` choices in the workflow.

No `.tf` file needs to change; naming and tagging follow `var.environment`.
