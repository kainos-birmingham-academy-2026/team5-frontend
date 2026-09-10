import { describe, expect, it } from "vitest";
import { getRoleIdFromToken } from "../src/lib/jwt";

const tokenWithPayload = (payload: object): string =>
	`header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;

describe("getRoleIdFromToken", () => {
	it("extracts a numeric role ID from a JWT payload", () => {
		expect(getRoleIdFromToken(tokenWithPayload({ roleId: 1 }))).toBe(1);
	});

	it("returns undefined for malformed tokens or missing role IDs", () => {
		expect(getRoleIdFromToken("not-a-token")).toBeUndefined();
		expect(getRoleIdFromToken(tokenWithPayload({}))).toBeUndefined();
	});
});