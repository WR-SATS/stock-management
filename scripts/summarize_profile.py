import json
from pathlib import Path

data = json.loads(Path("docs/workbook-profile.json").read_text(encoding="utf-8"))

for sheet in data:
    print(f"\n### {sheet['sheet']}")
    print(f"rows={sheet['max_row']} cols={sheet['max_column']} header_row={sheet['inferred_header_row']}")
    header = [value for value in sheet["header"][:25] if value not in (None, "")]
    print("header:", header)
    print("sample:")
    for row in sheet["sample_after_header"][:3]:
        print(" ", row[:20])
