terraform {
  required_version = ">= 1.5"

  # State lives in Azure Storage so the whole team shares it.
  # Locking is automatic via blob leases. Create these resources first with
  # scripts/bootstrap-remote-state.sh.
  # Left empty on purpose: each environment supplies its own settings, e.g.
  #   terraform init -backend-config=backends/dev.hcl
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Credentials and subscription come from ARM_* environment variables, so the same
# code runs locally (az login) and in CI (service principal).
provider "azurerm" {
  features {}
}

locals {
  name_prefix         = "${var.project}-${var.environment}"
  resource_group_name = coalesce(var.resource_group_name, "rg-${local.name_prefix}")

  common_tags = merge(
    {
      project     = var.project
      environment = var.environment
      managed_by  = "terraform"
    },
    var.tags,
  )
}

module "resource_group" {
  source = "./modules/resource-group"

  name     = local.resource_group_name
  location = var.location
  tags     = local.common_tags
}

# Keeps the already-applied resource group instead of destroying and recreating it
# now that it moved inside the module.
moved {
  from = azurerm_resource_group.main
  to   = module.resource_group.azurerm_resource_group.this
}
