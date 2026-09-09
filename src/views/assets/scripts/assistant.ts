const form = document.querySelector<HTMLFormElement>("[data-assistant-form]");
const input = document.querySelector<HTMLTextAreaElement>(
	"[data-assistant-input]",
);
const log = document.querySelector<HTMLElement>("[data-assistant-log]");
const sendButton = document.querySelector<HTMLButtonElement>(
	"[data-assistant-send]",
);
const counter = document.querySelector<HTMLElement>("[data-assistant-counter]");

type MessageVariant = "user" | "bot" | "error";

const maxLength = Number(input?.dataset.assistantMax ?? 1000);
let isPending = false;

const scrollToLatest = (): void => {
	if (!log) return;
	log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
};

const MAX_INPUT_HEIGHT = 160;

const resizeInput = (): void => {
	if (!input) return;
	input.style.height = "auto";
	const height = Math.min(input.scrollHeight, MAX_INPUT_HEIGHT);
	input.style.height = `${height}px`;
	input.style.overflowY =
		input.scrollHeight > MAX_INPUT_HEIGHT ? "auto" : "hidden";
};

const updateCounter = (): void => {
	if (!input) return;
	const length = input.value.length;
	if (counter) counter.textContent = `${length} / ${maxLength}`;
	if (sendButton) sendButton.disabled = isPending || input.value.trim() === "";
};

const createAvatar = (variant: MessageVariant): HTMLElement => {
	const avatar = document.createElement("span");
	avatar.className = `assistant-avatar assistant-avatar-${variant === "user" ? "user" : "bot"}`;
	avatar.setAttribute("aria-hidden", "true");
	avatar.textContent = variant === "user" ? "You" : "K";
	return avatar;
};

const BULLET_PATTERN = /^\s*[-*\u2022]\s+/;

// The model replies in light markdown, so bold and bullets are rendered as nodes rather than HTML.
const appendInline = (target: HTMLElement, text: string): void => {
	for (const segment of text.split(/(\*\*[^*]+\*\*)/g)) {
		if (!segment) continue;

		if (segment.startsWith("**") && segment.endsWith("**")) {
			const strong = document.createElement("strong");
			strong.textContent = segment.slice(2, -2);
			target.append(strong);
			continue;
		}

		target.append(document.createTextNode(segment));
	}
};

const appendAnswer = (bubble: HTMLElement, text: string): void => {
	for (const block of text.split(/\n{2,}/)) {
		const lines = block.split("\n").filter((line) => line.trim() !== "");
		if (lines.length === 0) continue;

		if (lines.every((line) => BULLET_PATTERN.test(line))) {
			const list = document.createElement("ul");
			list.className = "assistant-list";

			for (const line of lines) {
				const item = document.createElement("li");
				appendInline(item, line.replace(BULLET_PATTERN, ""));
				list.append(item);
			}

			bubble.append(list);
			continue;
		}

		const paragraph = document.createElement("p");
		paragraph.className = "assistant-text";
		appendInline(paragraph, lines.join("\n"));
		bubble.append(paragraph);
	}
};

const createMessage = (
	author: string,
	text: string,
	variant: MessageVariant,
): HTMLElement => {
	const message = document.createElement("article");
	message.className = `assistant-message assistant-message-${variant}`;

	const bubble = document.createElement("div");
	bubble.className = "assistant-bubble";

	const name = document.createElement("p");
	name.className = "assistant-author";
	name.textContent = author;
	bubble.append(name);

	if (variant === "bot") {
		appendAnswer(bubble, text);
	} else {
		const body = document.createElement("p");
		body.className = "assistant-text";
		body.textContent = text;
		bubble.append(body);
	}

	message.append(createAvatar(variant), bubble);

	if (variant === "error") message.setAttribute("role", "alert");

	return message;
};

const createTypingIndicator = (): HTMLElement => {
	const message = document.createElement("article");
	message.className = "assistant-message assistant-message-bot";

	const bubble = document.createElement("div");
	bubble.className = "assistant-bubble assistant-bubble-typing";

	const label = document.createElement("span");
	label.className = "ds-sr-only";
	label.textContent = "The assistant is thinking";
	bubble.append(label);

	for (let dot = 0; dot < 3; dot += 1) {
		const indicator = document.createElement("span");
		indicator.className = "assistant-dot";
		indicator.setAttribute("aria-hidden", "true");
		bubble.append(indicator);
	}

	message.append(createAvatar("bot"), bubble);
	return message;
};

const setPending = (pending: boolean): void => {
	isPending = pending;
	if (input) input.readOnly = pending;
	if (sendButton) {
		sendButton.textContent = pending ? "Sending" : "Send";
		sendButton.disabled = pending || !input || input.value.trim() === "";
	}
};

const askAssistant = async (question: string): Promise<void> => {
	if (!log || isPending) return;

	setPending(true);
	log.append(createMessage("You", question, "user"));
	const typing = createTypingIndicator();
	log.append(typing);
	scrollToLatest();

	try {
		const response = await fetch("/assistant/questions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ question }),
		});

		const payload = (await response.json().catch(() => null)) as {
			answer?: string;
			error?: string;
		} | null;

		typing.remove();

		if (response.ok && payload?.answer) {
			log.append(createMessage("Assistant", payload.answer, "bot"));
		} else {
			log.append(
				createMessage(
					"Assistant",
					payload?.error ??
						"Something went wrong while answering that. Please try again.",
					"error",
				),
			);
		}
	} catch {
		typing.remove();
		log.append(
			createMessage(
				"Assistant",
				"We could not reach the assistant. Check your connection and try again.",
				"error",
			),
		);
	} finally {
		setPending(false);
		scrollToLatest();
		input?.focus();
	}
};

const submitQuestion = (): void => {
	if (!input) return;

	const question = input.value.trim();
	if (!question || isPending) return;

	input.value = "";
	resizeInput();
	updateCounter();
	void askAssistant(question);
};

if (form && input && log) {
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		submitQuestion();
	});

	input.addEventListener("input", () => {
		resizeInput();
		updateCounter();
	});

	input.addEventListener("keydown", (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			submitQuestion();
		}
	});

	for (const suggestion of document.querySelectorAll<HTMLButtonElement>(
		"[data-assistant-suggestion]",
	)) {
		suggestion.addEventListener("click", () => {
			if (isPending) return;
			input.value = suggestion.textContent?.trim() ?? "";
			resizeInput();
			updateCounter();
			submitQuestion();
		});
	}

	resizeInput();
	updateCounter();
}
