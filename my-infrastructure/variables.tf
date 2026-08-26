variable "resource_group_name" {
  description = "Name of the Azure resource group."
  type        = string
  default     = "jaleel-infrastructure"

  validation {
    condition     = can(regex("^[a-zA-Z0-9._()-]{1,90}$", var.resource_group_name)) && !endswith(var.resource_group_name, ".")
    error_message = "Resource group name must be 1-90 characters of alphanumerics, underscores, parentheses, hyphens or periods, and cannot end with a period."
  }
}

variable "location" {
  description = "Azure region the resource group is created in. Extend the allowed list below as needed."
  type        = string
  default     = "uksouth"

  validation {
    condition = contains([
      "uksouth",
      "ukwest",
      "westeurope",
      "northeurope",
      "eastus",
      "eastus2",
      "westus2",
      "westus3",
    ], var.location)
    error_message = "Location must be one of the approved regions listed in variables.tf."
  }
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, prod."
  }
}

variable "tags" {
  description = "Additional tags merged into the tags applied to every resource."
  type        = map(string)
  default     = {}
}
