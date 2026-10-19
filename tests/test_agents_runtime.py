"""Guards for the runtime-agnostic entry point on this fork.

.claude/commands/*.md stay the runbooks. AGENTS.md is what a non-Claude
agent reads first: tool names map to capabilities, $ARGUMENTS is the
user's input, Singapore is the default region, and Gmail is not pinned
to one MCP prefix.
"""
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
AGENTS = REPO / "AGENTS.md"
GMAIL = REPO / ".claude" / "commands" / "gmail-sync.md"
NOTION = REPO / ".claude" / "commands" / "notion-sync.md"


class TestAgentsEntryPoint(unittest.TestCase):
    def setUp(self):
        self.text = AGENTS.read_text(encoding="utf-8")

    def test_arguments_means_user_input(self):
        self.assertIn("$ARGUMENTS", self.text)
        self.assertIn("user's input", self.text)

    def test_tool_names_map_to_capabilities(self):
        for name in (
            "WebFetch",
            "WebSearch",
            "Agent",
            "Task",
            "AskUserQuestion",
            "Read",
            "Write",
            "Edit",
            "Bash",
            "Glob",
            "Grep",
        ):
            self.assertIn(name, self.text, name)

    def test_singapore_is_the_default_region(self):
        self.assertIn("Default region is Singapore", self.text)
        self.assertIn("docs/singapore/region-defaults.md", self.text)
        self.assertIn("Europe", self.text)
        self.assertIn("United States", self.text)

    def test_personal_data_pointer(self):
        self.assertIn("docs/PRIVACY.md", self.text)
        self.assertIn("JOB_SEARCH_HOME", self.text)
        self.assertIn("personal/", self.text)
        self.assertIn("Never modify a tracked template", self.text)


class TestProfileWritesLeaveTheTemplates(unittest.TestCase):
    """Commands that fill a profile or the tracker write outside the tracked templates."""

    def test_writers_resolve_the_personal_directory_first(self):
        for name in (
            "setup.md",
            "apply.md",
            "expand.md",
            "interview.md",
            "outcome.md",
            "gmail-sync.md",
            "reset.md",
        ):
            text = (REPO / ".claude" / "commands" / name).read_text(encoding="utf-8")
            with self.subTest(command=name):
                self.assertIn("$JOB_SEARCH_HOME", text)
                self.assertIn("personal/", text)
                self.assertIn("Never modify a tracked template", text)


class TestConnectorRunbooks(unittest.TestCase):
    def test_gmail_is_not_pinned_to_the_claude_prefix(self):
        text = GMAIL.read_text(encoding="utf-8")
        self.assertNotIn("mcp__claude_ai_Gmail__", text)
        for op in ("search_threads", "get_thread", "list_labels"):
            self.assertIn(op, text)

    def test_notion_is_optional_and_names_alternatives(self):
        text = NOTION.read_text(encoding="utf-8")
        self.assertIn("## Optional destination", text)
        self.assertIn("Google Docs", text)
        self.assertIn("html-report", text)
        self.assertIn("google-docs", text)
