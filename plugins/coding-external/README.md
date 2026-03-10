# Coding Plugin

> **Disclaimer**: I am not the developer of the underlying skills, agents, or tools within this plugin. I have simply packaged them for ease of use. Please refer to the original creators for attribution, support, and contributions.

A comprehensive suite of AI-powered coding utilities for Claude Code. This plugin provides five specialized skills to help you explain, review, refactor, test, and debug your code with expert-level guidance.

## Overview

The `coding` plugin enhances your development workflow with intelligent assistants for common coding tasks:

- **Code Explainer** - Understand complex code through visual diagrams and clear explanations
- **Code Reviewer** - Get comprehensive code reviews covering quality, security, and best practices
- **Refactor** - Improve code structure while preserving functionality
- **Test Generator** - Create thorough test suites with proper coverage
- **Bug Finder** - Identify potential bugs and logic errors before they cause problems

## Installation

### From Marketplace

```bash
claude plugin install coding
```

### Manual Installation

1. Clone this repository or download the plugin directory
2. Copy the `coding` folder to your Claude Code plugins directory
3. Restart Claude Code or reload plugins

## Skills

### 1. Code Explainer

**Purpose**: Make complex code understandable through clear explanations, visual aids, and analogies.

**Usage**:
```bash
# Direct invocation
/code-explainer

# Automatic invocation
"How does this authentication function work?"
"What does this code do?"
"Explain this algorithm"
```

**Features**:
- High-level overview followed by detailed walkthrough
- ASCII diagrams and flowcharts for complex logic
- Real-world analogies for abstract concepts
- Highlights gotchas and edge cases
- Provides usage examples

**Example**:
```
> /code-explainer

[Claude analyzes the selected code and provides:]
- Purpose and context
- Step-by-step execution flow
- Visual diagrams for complex logic
- Key concepts and patterns used
- Common pitfalls to avoid
- Practical usage examples
```

---

### 2. Code Reviewer

**Purpose**: Comprehensive code review evaluating quality, security, performance, and best practices.

**Usage**:
```bash
# Direct invocation
/code-reviewer

# Automatic invocation
"Review this pull request"
"Can you review my code?"
"Feedback on this implementation"
```

**Review Dimensions**:
- ✅ Correctness & Logic
- ✅ Code Quality (readability, maintainability)
- ✅ Security (OWASP vulnerabilities, input validation)
- ✅ Performance (complexity, optimization opportunities)
- ✅ Best Practices (idioms, patterns, testing)
- ✅ Architecture & Design

**Output Structure**:
- Summary of overall code quality
- Critical issues 🔴 (must fix)
- Important issues 🟡 (should fix)
- Suggestions 🔵 (nice to have)
- Questions 💡 (clarifications needed)
- Positive notes ✅ (what was done well)
- Overall recommendation

**Example**:
```
> /code-reviewer

## Summary
This authentication endpoint has solid structure but contains critical
security issues around password handling that must be addressed.

## Critical Issues 🔴

### 1. Plain Text Password Storage (line 34)
Issue: Passwords stored without hashing
Fix: Use bcrypt to hash passwords before storage
[specific code example provided]

[... detailed review continues ...]
```

---

### 3. Refactor

**Purpose**: Improve code readability, maintainability, and performance while preserving functionality.

**Usage**:
```bash
# Direct invocation
/refactor

# Automatic invocation
"Clean up this code"
"Refactor this function"
"Make this more readable"
```

**Refactoring Techniques**:
- Extract Function/Method
- Replace Conditional with Polymorphism
- Consolidate Conditional Logic
- Introduce Parameter Object
- Replace Magic Numbers with Named Constants
- Decompose Complex Conditions
- Replace Loop with Collection Methods

**Process**:
1. Analyze current code structure
2. Identify code smells and opportunities
3. Create step-by-step refactoring plan
4. Apply changes incrementally
5. Verify behavior preservation

**Example**:
```
> /refactor

## Refactoring Plan

Current Issues:
- Long function (80 lines) violates Single Responsibility Principle
- Magic numbers throughout
- Nested conditionals make logic hard to follow

Proposed Changes:
1. Extract validation logic into separate function
2. Replace magic numbers with named constants
3. Simplify conditional logic with guard clauses

[Detailed before/after code examples with explanations]
```

---

### 4. Test Generator

**Purpose**: Generate comprehensive test suites covering unit tests, integration tests, and edge cases.

**Usage**:
```bash
# Direct invocation
/test-generator

# Automatic invocation
"Write tests for this function"
"Generate test cases"
"Create unit tests"
```

**Test Categories**:
- **Unit Tests** - Individual function/method testing with mocked dependencies
- **Integration Tests** - Component interaction and data flow
- **Edge Case Tests** - Boundary values, empty inputs, invalid data
- **Error Handling Tests** - Exception scenarios and failure cases

**Test Pattern**: Arrange-Act-Assert (AAA)

**Features**:
- Framework-specific syntax (Jest, Vitest, pytest, etc.)
- Clear test naming conventions
- Proper mocking and stubbing
- Test data factories and fixtures
- Coverage recommendations

**Example**:
```
> /test-generator

## Test Suite for calculateDiscount()

### Unit Tests

describe('calculateDiscount', () => {
  test('should apply 10% discount for premium users', () => {
    // Arrange
    const user = { type: 'premium' };
    const price = 100;

    // Act
    const result = calculateDiscount(user, price);

    // Assert
    expect(result).toBe(90);
  });

  test('should return original price for standard users', () => {
    // ...
  });

  test('should throw error when price is negative', () => {
    // ...
  });
});

[... complete test suite continues ...]
```

---

### 5. Bug Finder

**Purpose**: Identify potential bugs, logic errors, and common programming mistakes through systematic analysis.

**Usage**:
```bash
# Direct invocation
/bug-finder

# Automatic invocation
"Find bugs in this code"
"Debug this function"
"Why isn't this working?"
```

**Bug Categories Detected**:
- **Logic Errors** - Off-by-one errors, wrong operators, flawed conditionals
- **Null/Undefined Issues** - Missing null checks, empty collection handling
- **Type Errors** - Type mismatches, coercion bugs, missing validation
- **Async/Concurrency** - Missing await, race conditions, unhandled promises
- **Resource Management** - Memory leaks, unclosed files/connections
- **Security Vulnerabilities** - SQL injection, XSS, path traversal
- **Error Handling** - Swallowed errors, too-broad exception handling
- **Performance** - N+1 queries, unnecessary re-renders, inefficient algorithms

**Severity Levels**:
- 🔴 **Critical** - Data corruption, security holes, crashes
- 🟠 **High** - Incorrect logic, unhandled errors, memory leaks
- 🟡 **Medium** - Edge case failures, poor error messages, performance issues
- 🔵 **Low** - Code smells, style violations, minor inefficiencies

**Example**:
```
> /bug-finder

## Bug Analysis Report

### Summary
Found 1 critical bug, 2 high priority bugs, and 3 medium issues.

## Critical Bugs 🔴

### Bug #1: SQL Injection Vulnerability

Location: `auth.py:45`

Issue:
```python
query = f"SELECT * FROM users WHERE email = '{email}'"
cursor.execute(query)
```

Why It's a Bug: User input is directly interpolated into SQL query,
allowing attackers to inject malicious SQL code.

Impact: Complete database compromise, data theft, or deletion.

Fix:
```python
query = "SELECT * FROM users WHERE email = ?"
cursor.execute(query, (email,))
```

Explanation: Parameterized queries treat user input as data, not code.

[... analysis continues ...]
```

---

## Skill Invocation

All skills can be invoked in two ways:

### 1. Direct Invocation (User-Invocable)

Use the slash command with the skill name:

```bash
/code-explainer    # Explain selected or discussed code
/code-reviewer     # Review code for quality and issues
/refactor          # Suggest refactoring improvements
/test-generator    # Generate test cases
/bug-finder        # Analyze code for potential bugs
```

### 2. Automatic Invocation

Skills are automatically triggered by relevant questions or requests:

- **Code Explainer**: "How does this work?", "What does this code do?"
- **Code Reviewer**: "Review this PR", "Can you review my code?"
- **Refactor**: "Clean up this code", "Make this more readable"
- **Test Generator**: "Write tests for this", "Generate test cases"
- **Bug Finder**: "Find bugs", "Why isn't this working?", "Debug this"

## Best Practices

### When to Use Each Skill

- **Code Explainer**: Understanding unfamiliar code, onboarding new team members, documentation
- **Code Reviewer**: Pre-commit reviews, PR reviews, quality audits
- **Refactor**: Code maintenance, preparing for feature additions, reducing technical debt
- **Test Generator**: TDD workflows, increasing coverage, regression prevention
- **Bug Finder**: Pre-deployment checks, debugging sessions, security audits

### Combining Skills

Skills work great together:

1. **Code Review → Refactor → Test Generator**
   - Review identifies issues
   - Refactor improves structure
   - Tests ensure correctness

2. **Bug Finder → Code Explainer → Test Generator**
   - Find bugs in existing code
   - Understand why bugs exist
   - Write tests to prevent regression

3. **Code Explainer → Refactor → Code Reviewer**
   - Understand complex code
   - Simplify and improve it
   - Validate improvements

## Requirements

- Claude Code CLI (latest version)
- No additional dependencies

## Configuration

No configuration required - all skills work out of the box with sensible defaults.

## Examples

### Example 1: Full Code Review Workflow

```bash
# 1. Find potential bugs
/bug-finder

# 2. Get comprehensive review
/code-reviewer

# 3. Refactor based on feedback
/refactor

# 4. Generate tests for changes
/test-generator
```

### Example 2: Understanding Complex Code

```bash
# 1. Explain the code
/code-explainer

# 2. Identify improvement opportunities
/refactor

# 3. Document with tests
/test-generator
```

### Example 3: Debugging Workflow

```bash
# 1. Find bugs
/bug-finder

# 2. Understand the problematic code
/code-explainer

# 3. Generate tests to verify fix
/test-generator
```

## Contributing

Contributions welcome! To improve these skills:

1. Fork the repository
2. Modify skill markdown files in `skills/*/SKILL.md`
3. Test with Claude Code
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- Report issues on GitHub
- Request features via GitHub Issues
- Documentation: See individual skill markdown files

## Version History

### 1.0.0 (Current)
- Initial release
- Five core skills: code-explainer, code-reviewer, refactor, test-generator, bug-finder
- Comprehensive documentation and examples
- Full auto-invocation support

---

**Made with ❤️ for the Claude Code community**
