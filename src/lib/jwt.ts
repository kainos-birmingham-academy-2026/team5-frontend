export const APPLICANT_ROLE_ID = 1;

export const getRoleIdFromToken = (token: string): number | undefined => {
	try {
		const payload = token.split(".")[1];
		if (!payload) return undefined;
		const decoded = JSON.parse(
			Buffer.from(payload, "base64url").toString("utf8"),
		) as { roleId?: unknown };
		return typeof decoded.roleId === "number" ? decoded.roleId : undefined;
	} catch {
		return undefined;
	}
};