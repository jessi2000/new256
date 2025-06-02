# SectoolBox Security Documentation

## Overview
This document outlines the comprehensive security hardening measures implemented in the SectoolBox application to protect against common web application vulnerabilities and attacks.

## Security Features Implemented

### 1. File Upload Security

#### File Validation
- **File Size Limits**: Maximum file size restricted to 50MB
- **MIME Type Validation**: Only allowed file types can be uploaded
- **File Extension Validation**: Whitelist approach for file extensions
- **Content-Based Validation**: File contents are validated beyond just MIME type/extension
- **Filename Sanitization**: Dangerous characters and path traversal attempts are blocked

#### Allowed File Types
```
Text files: .txt, .csv, .json, .xml, .html, .htm
Archives: .zip, .tar, .gz, .7z, .rar
Executables: .exe, .dll, .so, .dylib, .bin (for security analysis)
Images: .jpg, .jpeg, .png, .gif, .bmp, .webp, .tiff
Documents: .pdf, .doc, .docx, .xls, .xlsx
Programming files: .py, .js, .c, .cpp, .h, .java
Configuration: .log, .conf, .cfg, .ini
```

#### Security Scanning
- **Entropy Analysis**: High entropy content detection (encrypted/compressed files)
- **Script Detection**: Scans for potentially dangerous script content
- **Header Analysis**: Detects executable file headers
- **Security Warnings**: Provides warnings for suspicious files

### 2. Input Sanitization & Validation

#### XSS Prevention
- **HTML Sanitization**: Uses bleach library to sanitize all text inputs
- **Script Tag Removal**: Removes `<script>` tags and JavaScript URLs
- **Attribute Filtering**: Strips dangerous HTML attributes
- **Character Encoding**: Proper encoding of special characters

#### Injection Protection
- **NoSQL Injection**: Input validation prevents MongoDB injection attacks
- **Path Traversal**: Blocks `../` and similar path traversal attempts
- **Command Injection**: Strict validation of script commands

#### Validation Rules
- **Length Limits**: All text inputs have maximum length restrictions
- **Format Validation**: UUID validation for IDs, proper data type validation
- **Content Filtering**: Removes potentially dangerous patterns from all inputs

### 3. Security Headers

#### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https:;
media-src 'self';
object-src 'none';
frame-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

#### Additional Security Headers
- **Strict-Transport-Security**: Forces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer-Policy**: Controls referrer information leakage
- **Cache-Control**: Prevents caching of sensitive data

### 4. Rate Limiting & Access Controls

#### Rate Limits (per IP address)
- **General Endpoints**: 30-60 requests per minute
- **File Upload**: 20 requests per minute
- **Script Execution**: 10 requests per minute (strict limit)
- **Announcements**: 10 create/5 delete requests per minute

#### Access Controls
- **IP-based Restrictions**: Rate limiting per client IP
- **Request Throttling**: Prevents abuse and DoS attacks
- **Endpoint-specific Limits**: Different limits for different functionality

### 5. Script Execution Security

#### Command Validation
- **Whitelist Approach**: Only allowed commands can be executed
- **Pattern Blocking**: Dangerous command patterns are blocked
- **Environment Isolation**: Scripts run with restricted environment variables

#### Allowed Commands
```
python, python3, node, bash, sh
grep, awk, sed, cat, head, tail
file, strings, hexdump, xxd
openssl, base64, md5sum, sha256sum
```

#### Execution Restrictions
- **Timeout**: 30-second execution timeout
- **Output Limits**: Maximum 1MB output size
- **Resource Limits**: Restricted PATH and environment
- **Sandbox Environment**: Scripts run in isolated directories

### 6. Error Handling & Information Disclosure

#### Secure Error Responses
- **Generic Messages**: No sensitive information in error messages
- **Status Code Mapping**: Consistent error responses
- **Request IDs**: Unique request identifiers for tracking
- **Timestamp**: Secure timestamp information

#### Prevented Information Disclosure
- **Stack Traces**: Internal errors don't expose stack traces
- **Database Errors**: MongoDB errors are not exposed to users
- **File System**: No file system information in responses
- **Configuration**: No environment variables or config details exposed

### 7. Logging & Monitoring

#### Security Event Logging
- **File Uploads**: Logs all file upload attempts with security analysis
- **Script Execution**: Tracks all script execution attempts
- **Rate Limit Violations**: Records rate limiting violations
- **Security Violations**: Logs potential security threats
- **Error Events**: Comprehensive error logging

#### Log Format
```
TIMESTAMP - SECURITY - LEVEL - EVENT_TYPE - IP: client_ip, Details: event_details
```

#### Monitored Events
- File upload security violations
- Script execution attempts and failures
- Rate limit violations
- Authentication failures
- Suspicious request patterns
- Error conditions

### 8. CORS Security

#### Restricted Origins
- **Production**: Specific domain whitelist
- **Development**: localhost and HTTPS localhost only
- **No Wildcards**: No `*` origins allowed in production

#### Limited Methods & Headers
- **Methods**: Only GET, POST, DELETE allowed
- **Headers**: Restricted to necessary headers only
- **Credentials**: Disabled for security

### 9. Database Security

#### MongoDB Protection
- **Connection Security**: Secure connection strings
- **Data Validation**: All data validated before storage
- **Injection Prevention**: Parameterized queries and input validation
- **Access Logging**: Database operations are logged

#### Data Sanitization
- **Input Cleaning**: All user inputs sanitized before storage
- **Output Encoding**: Data properly encoded when retrieved
- **Type Validation**: Strict data type enforcement

### 10. File System Security

#### Secure File Handling
- **Restricted Permissions**: Upload directories have 700 permissions
- **File Isolation**: Uploaded files isolated in secure directories
- **Cleanup**: Automatic cleanup of temporary files
- **Path Validation**: All file paths validated and sanitized

## Security Testing

### Automated Tests
- **Input Validation**: Tests for XSS and injection attacks
- **File Upload**: Tests for malicious file uploads
- **Rate Limiting**: Verification of rate limit enforcement
- **Header Validation**: Checks for proper security headers

### Manual Testing Recommendations
1. **File Upload Testing**: Try uploading various file types and malicious content
2. **Input Testing**: Test all forms with XSS and injection payloads
3. **Rate Limit Testing**: Verify rate limits are properly enforced
4. **Header Testing**: Check that all security headers are present
5. **Error Testing**: Ensure no sensitive information is disclosed in errors

## Production Deployment Recommendations

### Additional Security Measures
1. **Web Application Firewall (WAF)**: Deploy a WAF for additional protection
2. **TLS Configuration**: Use strong TLS configurations (TLS 1.2+)
3. **Network Security**: Implement network-level security controls
4. **Regular Updates**: Keep all dependencies updated
5. **Security Monitoring**: Implement real-time security monitoring
6. **Backup Security**: Secure backup procedures and testing

### Environment Configuration
1. **Environment Variables**: Secure handling of sensitive configuration
2. **Database Security**: Additional database security measures
3. **Logging**: Centralized security logging and alerting
4. **Incident Response**: Incident response procedures
5. **Regular Audits**: Periodic security audits and penetration testing

## Security Maintenance

### Regular Tasks
1. **Dependency Updates**: Keep all security libraries updated
2. **Log Review**: Regular review of security logs
3. **Configuration Review**: Periodic review of security configurations
4. **Vulnerability Scanning**: Regular vulnerability assessments
5. **Security Training**: Keep security knowledge up to date

### Monitoring & Alerting
- **Failed Login Attempts**: Monitor for brute force attacks
- **Rate Limit Violations**: Alert on excessive rate limit violations
- **File Upload Anomalies**: Monitor for suspicious file uploads
- **Error Spikes**: Alert on unusual error patterns
- **Security Events**: Real-time alerting for security incidents

## Compliance Notes

While this application is not designed for sensitive data, the security measures implemented provide a solid foundation for:
- **OWASP Top 10 Protection**: Protection against common web vulnerabilities
- **Security Best Practices**: Implementation of industry security standards
- **Data Protection**: Basic data protection measures
- **Audit Trail**: Comprehensive logging for security auditing

## Contact & Support

For security-related questions or to report security issues:
- Review logs in `/var/log/sectoolbox.log`
- Check security events in application logs
- Monitor rate limiting and security violations
- Report any security concerns immediately

---

**Note**: This security implementation is designed for a non-production environment handling non-sensitive data. For production deployments with sensitive data, additional security measures and compliance requirements may be necessary.