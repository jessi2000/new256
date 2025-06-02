#!/usr/bin/env python3
"""
Simple TCP Port Scanner
A basic port scanner for security testing and network assessment
"""

import socket
import sys
from concurrent.futures import ThreadPoolExecutor
import time

def scan_port(host, port, timeout=1):
    """Scan a single port on the given host"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            if result == 0:
                try:
                    # Try to get service name
                    service = socket.getservbyport(port)
                    return f"Port {port}: OPEN ({service})"
                except:
                    return f"Port {port}: OPEN"
            return None
    except socket.gaierror:
        return f"Error: Could not resolve hostname {host}"
    except Exception as e:
        return f"Error scanning port {port}: {str(e)}"

def main():
    print("SectoolBox Port Scanner v1.0")
    print("=" * 40)
    
    # Default scan parameters
    host = "127.0.0.1"  # Localhost for safety
    ports = [22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 993, 995, 1723, 3306, 3389, 5432, 5900, 8080]
    
    print(f"Scanning host: {host}")
    print(f"Scanning {len(ports)} common ports...")
    print("-" * 40)
    
    start_time = time.time()
    open_ports = []
    
    # Use ThreadPoolExecutor for concurrent scanning
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = {executor.submit(scan_port, host, port): port for port in ports}
        
        for future in futures:
            result = future.result()
            if result and "OPEN" in result:
                open_ports.append(result)
                print(result)
    
    end_time = time.time()
    scan_duration = end_time - start_time
    
    print("-" * 40)
    print(f"Scan completed in {scan_duration:.2f} seconds")
    print(f"Found {len(open_ports)} open ports on {host}")
    
    if not open_ports:
        print("No open ports found on the scanned range.")
    
    print("\nNote: This scanner is for educational and authorized testing only.")
    print("Only use on systems you own or have permission to test.")

if __name__ == "__main__":
    main()
