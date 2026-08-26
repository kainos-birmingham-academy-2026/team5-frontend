# Backend settings for the dev state file.
#   terraform init -backend-config=backends/dev.hcl
resource_group_name  = "rg-jaleel-team5-state"
storage_account_name = "jaleelteam5state"
container_name       = "tfstate"
key                  = "team5/dev/infrastructure.tfstate"
