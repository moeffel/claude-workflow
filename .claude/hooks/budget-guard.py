#!/usr/bin/env python3
"""Budget guard hook — warns when spawning agents without budget constraints."""
import json
import sys

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        tool_name = input_data.get("tool_name", "")
        if tool_name == "Agent":
            tool_input = input_data.get("tool_input", {})
            prompt = tool_input.get("prompt", "")
            if "budget" not in prompt.lower() and "constraint" not in prompt.lower():
                print("WARNING: Spawning agent without explicit budget constraints. "
                      "Consider adding budget limits to prevent runaway API costs.", file=sys.stderr)
    except Exception:
        pass
    sys.exit(0)

if __name__ == "__main__":
    main()
