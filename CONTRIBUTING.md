# Contributing to Data-to-Decision OS

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

1. Check existing [Issues](https://github.com/yourusername/datatodecision/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Suggesting Features

Open an issue with the `enhancement` label describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Commit with clear messages: `git commit -m "feat: add data validation module"`
7. Push and open a PR

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

### Development Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Frontend
cd frontend
npm install
```

### Code Style

- **Python**: Follow PEP 8, use type hints
- **JavaScript/React**: Use ESLint config provided
- **CSS**: Use BEM naming convention

### Project Structure

Each module follows this pattern:
```
modules/<module_name>/
├── __init__.py
├── service.py      # Business logic
├── models.py       # Database models
├── schemas.py      # Pydantic schemas
└── router.py       # API endpoints
```

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to learn and build together.

## Questions?

Open a discussion or reach out to the maintainers.

---

**Happy contributing! 🚀**
