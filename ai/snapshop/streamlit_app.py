import streamlit as st
import streamlit.components.v1 as components
import http.server
import socketserver
import threading
import os
import time
import socket

# Configuration
STATIC_PORT = 8506  # Internal static server port
BUILD_DIR = os.path.join(os.getcwd(), "out")

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def run_server():
    """Starts the static file server in a background thread."""
    print(f"DEBUG: Current CWD: {os.getcwd()}")
    print(f"DEBUG: expected BUILD_DIR: {BUILD_DIR}")
    
    if not os.path.exists(BUILD_DIR):
        st.error(f"Build directory not found at {BUILD_DIR}. Please run 'npm run build' first.")
        return

    # Check if port is already in use
    if is_port_in_use(STATIC_PORT):
        print(f"Port {STATIC_PORT} is already in use. Assuming it's our server.")
        return

    # Change to directory to serve
    os.chdir(BUILD_DIR)
    
    Handler = http.server.SimpleHTTPRequestHandler
    
    # Allow address reuse to prevent "Address already in use" errors during reloads
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", STATIC_PORT), Handler) as httpd:
            print(f"Serving static content at port {STATIC_PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Port {STATIC_PORT} error: {e}")

# Start the server in a separate thread if not already running
if 'server_thread' not in st.session_state:
    st.session_state['server_thread'] = threading.Thread(target=run_server, daemon=True)
    st.session_state['server_thread'].start()
    # Give it a moment to start
    time.sleep(1)

st.set_page_config(
    page_title="SnapBeautyShot",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit UI elements for immersive feel
hide_streamlit_style = """
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.block-container {padding: 0 !important; max-width: 100% !important;}
iframe {border: 0 !important;}
</style>
"""
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

# Main App Iframe
st.markdown(
    f'<iframe src="http://localhost:{STATIC_PORT}" width="100%" height="100vh" style="border:none; height: 100vh; width: 100%; position: absolute; top:0; left:0;" allow="camera; microphone; clipboard-write"></iframe>',
    unsafe_allow_html=True
)
