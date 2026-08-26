# Backend settings for the dev state file.
#   terraform init -backend-config=backends/dev.hcl
resource_group_name  = "rg-jaleel-team5-state"
storage_account_name = "jaleelteam5state"
container_name       = "tfstate"
key                  = "team5/dev/infrastructure.tfstate"
# Reach the blob with an Entra ID token instead of a shared account key, so
# callers only need Storage Blob Data Contributor (not listKeys).
use_azuread_auth = true
