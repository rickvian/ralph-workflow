About Ralph
Ralph is simple loop that prompts Gemini until it finishes work.
https://ghuntley.com/ralph/

This ralph setup is based on https://x.com/ryancarson/status/2008548371712135632

This is a guide for humans. AI agents should ignore this file.

### How It Works
A bash loop that:
Pipes a prompt into Gemini
Gemini picks the next story from prd.yaml
Gemini implements it
Gemini runs typecheck + tests
Gemini commits if passing
Gemini marks story done
Gemini logs learnings
Loop repeats until done

## Running Ralph

```bash
./scripts/ralph/ralph.sh 25
```
