#!/usr/bin/env python3
"""Brief validator hook — checks that new/modified briefs have all required sections."""
import json
import sys
import os

REQUIRED_SECTIONS = ["## Situation", "## Stakes", "## Constraints", "## Key Questions"]

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        tool_name = input_data.get("tool_name", "")
        if tool_name in ("Write", "Edit"):
            tool_input = input_data.get("tool_input", {})
            file_path = tool_input.get("file_path", "")
            if "briefs/" in file_path and not file_path.endswith("_template.md"):
                if os.path.exists(file_path):
                    with open(file_path) as f:
                        content = f.read()
                    missing = [s for s in REQUIRED_SECTIONS if s not in content]
                    if missing:
                        sections = ", ".join(s.replace("## ", "") for s in missing)
                        print(f"Brief validation: Missing required sections: {sections}", file=sys.stderr)
                        print("All briefs must have: Situation, Stakes, Constraints, Key Questions", file=sys.stderr)
    except Exception:
        pass
    sys.exit(0)

if __name__ == "__main__":
    main()
