# Contributing to Notion Relay Worker

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- **Check existing issues** first to avoid duplicates
- **Use issue templates** when available
- **Provide clear details**: steps to reproduce, expected vs actual behavior
- **Include environment info**: Node.js version, Cloudflare Workers version, etc.

### Suggesting Enhancements
- **Search existing suggestions** in issues and discussions
- **Explain the use case** and why it would benefit users
- **Consider implementation complexity** and breaking changes

### Contributing Code

#### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/notion-relay-worker.git
cd notion-relay-worker
npm install
```

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number
```

#### 3. Make Changes
- **Follow existing code style**
- **Add tests** for new functionality
- **Update documentation** if needed
- **Keep commits focused** and atomic

#### 4. Test Your Changes
```bash
# Run all tests
npm test

# Run smoke tests locally
npm run dev &
./test/smoke-test.sh http://localhost:8787

# Validate configuration
npm run validate
```

#### 5. Submit a Pull Request
- **Use a clear title** describing the change
- **Reference any related issues** (#123)
- **Provide detailed description** of what changed and why
- **Include testing instructions** if applicable

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for testing)

### Local Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run tests
npm test

# Validate configuration
npm run validate
```

### Testing with Real Notion API
1. Create a test Notion integration
2. Set up a test database
3. Configure `.env` with test credentials
4. Run integration tests

## 📝 Code Style

### General Guidelines
- **Use consistent formatting** (we may add Prettier later)
- **Write descriptive variable names**
- **Add comments for complex logic**
- **Keep functions focused and small**

### JavaScript Style
- Use `const` and `let` instead of `var`
- Prefer async/await over Promises
- Use template literals for string interpolation
- Add JSDoc comments for functions

### Error Handling
- Always handle async errors
- Provide meaningful error messages
- Log errors appropriately for debugging
- Return proper HTTP status codes

## 🧪 Testing Guidelines

### Unit Tests
- Test individual functions and logic
- Mock external dependencies (Notion API)
- Test error conditions and edge cases
- Aim for good test coverage

### Integration Tests
- Test complete workflows
- Use test environments when possible
- Include realistic payloads
- Test error scenarios

### Manual Testing
- Use the smoke test suite
- Test with various JSON payloads
- Verify Notion integration works
- Test error conditions

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for public functions
- Document complex algorithms
- Explain non-obvious business logic
- Keep comments up to date

### User Documentation
- Update README.md for new features
- Add examples for new functionality
- Update setup instructions if needed
- Keep API documentation current

## 🔒 Security Considerations

### Sensitive Data
- **Never commit secrets** or tokens
- **Use environment variables** for configuration
- **Validate all inputs** from users
- **Sanitize data** before sending to Notion

### API Security
- Consider rate limiting for new features
- Validate request sizes and formats
- Handle authentication properly
- Protect against common attacks

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **Patch** (1.0.1): Bug fixes, small improvements
- **Minor** (1.1.0): New features, backwards compatible
- **Major** (2.0.0): Breaking changes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Security review (if applicable)

## 🎯 Project Priorities

### High Priority
- **Reliability**: Worker should be stable and handle errors gracefully
- **Security**: Protect user data and prevent abuse
- **Documentation**: Clear setup and usage instructions
- **Testing**: Comprehensive test coverage

### Medium Priority
- **Performance**: Optimize for speed and resource usage
- **Features**: Add useful functionality based on user feedback
- **Developer Experience**: Make it easy to contribute and extend

### Low Priority
- **Advanced Features**: Complex functionality that few users need
- **Experimental APIs**: Bleeding-edge features that may change

## 💡 Ideas for Contributions

### Good First Issues
- Improve error messages
- Add more test cases
- Fix typos in documentation
- Add validation for edge cases

### Medium Complexity
- Add support for more Notion property types
- Implement request rate limiting
- Add batch processing capabilities
- Create deployment templates

### Advanced Features
- Multi-database routing
- Custom field mapping configuration
- Authentication/authorization systems
- Monitoring and analytics

## 🆘 Getting Help

### Before Asking for Help
1. **Read the documentation** thoroughly
2. **Search existing issues** and discussions
3. **Try the troubleshooting steps** in README
4. **Test with minimal examples**

### Where to Get Help
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Documentation**: Check README.md and wiki

### How to Ask Good Questions
- **Be specific** about what you're trying to do
- **Include relevant code** and error messages
- **Describe what you've already tried**
- **Provide context** about your use case

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for contributing to Notion Relay Worker!** 🎉 