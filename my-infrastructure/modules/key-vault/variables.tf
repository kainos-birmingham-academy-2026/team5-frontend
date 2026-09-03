variable "name" {
  description = "Globally unique Key Vault name (3-24 alphanumeric characters or hyphens)."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]{1,22}[a-zA-Z0-9]$", var.name))
    error_message = "Key Vault name must be 3-24 characters, start with a letter, and contain only alphanumerics or hyphens."
  }
}

variable "resource_group_name" {
  description = "Resource group that will contain the Key Vault."
  type        = string
}

variable "location" {
  description = "Azure region for the Key Vault."
  type        = string
}

variable "tenant_id" {
  description = "Entra ID tenant the Key Vault is bound to."
  type        = string
}

variable "tags" {
  description = "Tags applied to the Key Vault."
  type        = map(string)
  default     = {}
}
