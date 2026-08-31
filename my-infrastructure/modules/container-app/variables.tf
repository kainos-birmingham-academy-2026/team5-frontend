variable "name" {
  description = "Name of the Container App (2-32 lowercase alphanumerics or hyphens)."
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,30}[a-z0-9]$", var.name)) && length(var.name) <= 32
    error_message = "Container App name must be 2-32 characters, start with a letter, and contain only lowercase alphanumerics or hyphens."
  }
}

variable "container_name" {
  description = "Name of the container inside the app revision."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group that will contain the Container App."
  type        = string
}

variable "container_app_environment_id" {
  description = "Resource ID of the Container Apps environment this app attaches to."
  type        = string
}

variable "image" {
  description = "Full image reference, e.g. acraiacademy26.azurecr.io/team5-frontend:latest."
  type        = string
}

variable "target_port" {
  description = "Port the container process listens on."
  type        = number
}

variable "external_enabled" {
  description = "When true, the app is reachable from the public internet. Backend should be false."
  type        = bool
}

variable "identity_id" {
  description = "User-assigned identity resource ID used to pull from ACR and read Key Vault."
  type        = string
}

variable "container_registry_login_server" {
  description = "ACR login server the identity is granted AcrPull on."
  type        = string
}

variable "key_vault_uri" {
  description = "Key Vault URI used to build secret references. Secret values are not stored in Terraform."
  type        = string
}

variable "env" {
  description = "Plain environment variables (non-secret)."
  type        = map(string)
  default     = {}
}

variable "secret_env" {
  description = "Map of environment variable name to Key Vault secret name. Values must already exist in the portal."
  type        = map(string)
  default     = {}
}

variable "cpu" {
  description = "CPU cores allocated to the container (must pair with memory)."
  type        = number
  default     = 0.25
}

variable "memory" {
  description = "Memory allocated to the container, e.g. 0.5Gi."
  type        = string
  default     = "0.5Gi"
}

variable "min_replicas" {
  description = "Minimum replica count. Stay at 1 while sessions are in-memory."
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Maximum replica count."
  type        = number
  default     = 1
}

variable "tags" {
  description = "Tags applied to the Container App."
  type        = map(string)
  default     = {}
}
