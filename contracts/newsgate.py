# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import typing

class NewsGate(gl.Contract):
    last_claim: str
    last_verdict: str

    def __init__(self):
        self.last_claim = ""
        self.last_verdict = ""

    @gl.public.write
    def verify_claim(self, claim: str) -> typing.Any:
        def get_verdict() -> str:
            result = gl.nondet.exec_prompt(
                'Is this claim true? Claim: "' + claim + '". Reply ONLY with one word: VERIFIED, DISPUTED, or UNVERIFIABLE'
            )
            return result

        verdict = gl.eq_principle.strict_eq(get_verdict)

        if "VERIFIED" in verdict:
            self.last_verdict = "VERIFIED"
        elif "DISPUTED" in verdict:
            self.last_verdict = "DISPUTED"
        else:
            self.last_verdict = "UNVERIFIABLE"

        self.last_claim = claim

    @gl.public.view
    def get_last_verdict(self) -> str:
        return self.last_verdict

    @gl.public.view
    def get_last_claim(self) -> str:
        return self.last_claim