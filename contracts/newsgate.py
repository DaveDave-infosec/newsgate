# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import typing


class NewsGate(gl.Contract):
    last_claim: str
    last_verdict: str
    last_reasoning: str
    last_source_excerpt: str

    def __init__(self):
        self.last_claim = ""
        self.last_verdict = ""
        self.last_reasoning = ""
        self.last_source_excerpt = ""

    @gl.public.write
    def verify_claim(self, claim: str) -> typing.Any:
        is_url = claim.startswith("http://") or claim.startswith("https://")
        source_text = ""

        if is_url:
            def fetch_url() -> str:
                try:
                    body = gl.nondet.web.render(claim, mode='text')
                    if not body or len(body.strip()) < 100:
                        response = gl.nondet.web.get(claim)
                        body = response.body.decode("utf-8", errors="ignore")
                except Exception:
                    response = gl.nondet.web.get(claim)
                    body = response.body.decode("utf-8", errors="ignore")

                if len(body) > 12000:
                    body = body[:12000]
                return body

            source_text = gl.eq_principle.strict_eq(fetch_url)

        if is_url:
            prompt = (
                "You are a careful news fact-checker. Below is the text of an "
                "article fetched from the URL: " + claim + "\n\n"
                "ARTICLE TEXT:\n" + source_text + "\n\n"
                "Decide whether the article presents factually accurate, "
                "well-sourced information that a reasonable journalist would "
                "publish. Respond with EXACTLY one line in this format:\n"
                "VERDICT|REASONING\n\n"
                "VERDICT must be one of: VERIFIED, DISPUTED, UNVERIFIABLE.\n"
                "- VERIFIED if the article appears factual and well-sourced.\n"
                "- DISPUTED if the article contains misleading, false, or "
                "heavily biased claims.\n"
                "- UNVERIFIABLE if the page does not contain enough content "
                "to judge or you cannot tell.\n"
                "REASONING must be a short single-sentence explanation, no "
                "longer than 200 characters, no line breaks."
            )
        else:
            prompt = (
                "You are a careful fact-checker. Evaluate this claim:\n"
                "CLAIM: " + claim + "\n\n"
                "Respond with EXACTLY one line in this format:\n"
                "VERDICT|REASONING\n\n"
                "VERDICT must be one of: VERIFIED, DISPUTED, UNVERIFIABLE.\n"
                "- VERIFIED if you are confident the claim is true.\n"
                "- DISPUTED if you are confident the claim is false or "
                "misleading.\n"
                "- UNVERIFIABLE if you do not have enough information to "
                "judge confidently. Use this for very recent events, niche "
                "topics, or anything you are not sure about.\n"
                "REASONING must be a short single-sentence explanation, no "
                "longer than 200 characters, no line breaks."
            )

        def leader_fn() -> str:
            raw = gl.nondet.exec_prompt(prompt)
            return raw.strip()

        def validator_fn(leader_result: gl.vm.Result) -> bool:
            try:
                if not isinstance(leader_result, gl.vm.Return):
                    return False
                leader_text = leader_result.calldata
                my_text = leader_fn()
                leader_verdict = _parse_verdict(leader_text)
                my_verdict = _parse_verdict(my_text)
                return leader_verdict == my_verdict and leader_verdict != ""
            except Exception:
                return False

        outcome = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        verdict = _parse_verdict(outcome)
        reasoning = _parse_reasoning(outcome)

        if verdict not in ("VERIFIED", "DISPUTED", "UNVERIFIABLE"):
            verdict = "UNVERIFIABLE"
            reasoning = "Could not parse a verdict from the LLM response."

        excerpt = ""
        if source_text:
            excerpt = source_text[:1500]

        self.last_claim = claim
        self.last_verdict = verdict
        self.last_reasoning = reasoning
        self.last_source_excerpt = excerpt

    @gl.public.view
    def get_last_verdict(self) -> str:
        return self.last_verdict

    @gl.public.view
    def get_last_claim(self) -> str:
        return self.last_claim

    @gl.public.view
    def get_last_reasoning(self) -> str:
        return self.last_reasoning

    @gl.public.view
    def get_last_source_excerpt(self) -> str:
        return self.last_source_excerpt


def _parse_verdict(text: str) -> str:
    if not text:
        return ""
    upper = text.upper()
    for word in ("VERIFIED", "DISPUTED", "UNVERIFIABLE"):
        if word in upper:
            return word
    return ""


def _parse_reasoning(text: str) -> str:
    if not text:
        return ""
    if "|" in text:
        parts = text.split("|", 1)
        if len(parts) == 2:
            reasoning = parts[1].strip()
            if len(reasoning) > 300:
                reasoning = reasoning[:300]
            return reasoning
    cleaned = text.strip()
    if len(cleaned) > 300:
        cleaned = cleaned[:300]
    return cleaned
