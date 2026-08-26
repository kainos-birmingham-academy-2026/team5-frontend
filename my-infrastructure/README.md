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
