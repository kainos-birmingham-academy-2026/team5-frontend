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

variable "admin_object_ids" {
  description = "Principals granted Key Vault Administrator so they can add secrets in the portal."
  type        = list(string)
  default     = []
}

variable "secrets_users" {
  description = "Map of principals granted Key Vault Secrets User. Keys must be static (e.g. container_app); values may be apply-time object IDs."
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Tags applied to the Key Vault."
  type        = map(string)
  default     = {}
}
