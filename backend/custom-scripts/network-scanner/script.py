#!/usr/bin/env python3
"""
Network Scanner - Basic Reconnaissance Tool
A simple network scanning tool for CTF and security assessment
"""

import socket
import subprocess
import platform
from datetime import datetime
import threading
import time

def main():
    print("=" * 60)
    print("🌐 NETWORK SCANNER - CTF RECONNAISSANCE TOOL")
    print("=" * 60)
    print(f"⏰ Scan Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Demo targets for scanning
    demo_targets = [
        "127.0.0.1",
        "localhost", 
        "8.8.8.8",
        "1.1.1.1"
    ]
    
    # Common ports to scan
    common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 8080, 8443]
    
    print("🎯 DEMO TARGET ANALYSIS:")
    print("-" * 40)
    
    for target in demo_targets:
        print(f"\n📍 Scanning Target: {target}")
        print("-" * 30)
        
        # Resolve hostname
        try:
            ip_address = socket.gethostbyname(target)
            print(f"🔍 Resolved IP: {ip_address}")
        except socket.gaierror:
            print(f"❌ Could not resolve: {target}")
            continue
        
        # Check if host is reachable
        if ping_host(target):
            print(f"✅ Host is reachable")
        else:
            print(f"❌ Host appears to be down or filtered")
            continue
        
        # Port scanning
        print(f"🔍 Scanning common ports...")
        open_ports = []
        
        for port in common_ports:
            if scan_port(ip_address, port, timeout=1):
                service = get_service_name(port)
                open_ports.append((port, service))
                print(f"✅ Port {port}/{service} - OPEN")
        
        if not open_ports:
            print("🔒 No common ports found open")
        else:
            print(f"\n📊 Summary for {target}:")
            print(f"   Open Ports: {len(open_ports)}")
            for port, service in open_ports:
                print(f"   - {port}/{service}")
    
    # Network information gathering
    print("\n" + "=" * 60)
    print("🔧 NETWORK INFORMATION GATHERING")
    print("=" * 60)
    
    # System information
    print(f"💻 Operating System: {platform.system()} {platform.release()}")
    print(f"🏠 Hostname: {socket.gethostname()}")
    
    # Get local IP addresses
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        print(f"🌐 Local IP Address: {local_ip}")
    except Exception:
        print("🌐 Local IP Address: Unable to determine")
    
    # Port scanning techniques demo
    print("\n🔍 SCANNING TECHNIQUES DEMONSTRATED:")
    print("-" * 40)
    print("✅ TCP Connect Scan")
    print("✅ Service Detection")
    print("✅ Host Discovery (Ping)")
    print("✅ Hostname Resolution")
    print("✅ Network Interface Detection")
    
    # Security assessment
    print("\n🛡️ SECURITY ASSESSMENT:")
    print("-" * 40)
    
    # Check for common security indicators
    security_notes = []
    
    # Check if common secure ports are open
    secure_ports = [22, 443, 993, 995]
    insecure_ports = [21, 23, 80, 110, 143]
    
    print("🔐 Security Port Analysis:")
    print("  Secure Protocols: SSH(22), HTTPS(443), IMAPS(993), POP3S(995)")
    print("  Insecure Protocols: FTP(21), Telnet(23), HTTP(80), POP3(110), IMAP(143)")
    
    # CTF-style enumeration tips
    print("\n🎯 CTF ENUMERATION TIPS:")
    print("-" * 40)
    print("1. 🔍 Always scan for hidden services on unusual ports")
    print("2. 🌐 Check for web services on non-standard ports (8080, 8443)")
    print("3. 📁 Look for FTP anonymous access on port 21")
    print("4. 🔑 SSH on port 22 might have weak credentials")
    print("5. 🌍 HTTP services often reveal valuable information")
    print("6. 📧 Mail services can provide user enumeration")
    
    # Common CTF ports
    print("\n🏁 COMMON CTF PORTS TO CHECK:")
    print("-" * 40)
    ctf_ports = {
        21: "FTP - Anonymous access, file upload",
        22: "SSH - Brute force, key files", 
        23: "Telnet - Plain text protocols",
        25: "SMTP - Email enumeration",
        53: "DNS - Zone transfers, subdomain enum",
        80: "HTTP - Web vulnerabilities, directories",
        110: "POP3 - Email access",
        135: "RPC - Windows enumeration",
        139: "NetBIOS - SMB shares",
        143: "IMAP - Email access", 
        443: "HTTPS - SSL certificates, web apps",
        445: "SMB - File shares, null sessions",
        993: "IMAPS - Secure email",
        995: "POP3S - Secure email",
        3389: "RDP - Remote desktop",
        5985: "WinRM - Windows remote management"
    }
    
    for port, desc in list(ctf_ports.items())[:10]:
        print(f"  {port:>5}: {desc}")
    
    print("\n" + "=" * 60)
    print("✅ NETWORK SCAN COMPLETE")
    print("💡 Remember: Always scan responsibly and with permission")
    print("🔧 This tool demonstrates basic reconnaissance techniques")
    print("📚 For advanced scanning, consider: nmap, masscan, zmap")
    print("=" * 60)

def ping_host(host, timeout=3):
    """Check if host is reachable via ping"""
    try:
        # Determine ping command based on OS
        param = "-n" if platform.system().lower() == "windows" else "-c"
        command = ["ping", param, "1", "-W" if platform.system().lower() == "windows" else "-w", str(timeout), host]
        
        result = subprocess.run(command, capture_output=True, text=True, timeout=timeout+2)
        return result.returncode == 0
    except Exception:
        return False

def scan_port(host, port, timeout=1):
    """Scan a single port"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False

def get_service_name(port):
    """Get common service name for port"""
    services = {
        21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
        80: "HTTP", 110: "POP3", 135: "RPC", 139: "NetBIOS", 143: "IMAP",
        443: "HTTPS", 445: "SMB", 993: "IMAPS", 995: "POP3S", 
        3389: "RDP", 5985: "WinRM", 8080: "HTTP-Alt", 8443: "HTTPS-Alt"
    }
    return services.get(port, "Unknown")

if __name__ == "__main__":
    main()
