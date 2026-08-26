terraform {
  required_version = ">= 1.5"

  # State lives in Azure Storage so the whole team shares it.
  # Locking is automatic via blob leases. Create these resources first with
  # scripts/bootstrap-remote-state.sh.
  backend "azurerm" {
    resource_group_name  = "rg-jaleel-team5-state"
    storage_account_name = "jaleelteam5state"
    container_name       = "tfstate"
    key                  = "team5/infrastructure.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Subscription is taken from the ARM_SUBSCRIPTION_ID environment variable.
provider "azurerm" {
  features {}
}

module "resource_group" {
  source = "./modules/resource-group"

  name     = var.resource_group_name
  location = var.location

  tags = merge(
    {
      environment = var.environment
      managed_by  = "terraform"
    },
    var.tags,
  )
}

# Keeps the already-applied resource group instead of destroying and recreating it
# now that it moved inside the module.
moved {
  from = azurerm_resource_group.main
  to   = module.resource_group.azurerm_resource_group.this
}
