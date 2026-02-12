import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from brain import brain

# --- PAGE CONFIG ---
st.set_page_config(
    page_title="AD&I Market Intelligence",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- THEME & CSS (AI STUDIO AESTHETIC) ---
st.markdown("""
<style>
    /* Global Background & Font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    
    html, body, [class*="css"]  {
        font-family: 'Inter', sans-serif;
    }

    /* Cards */
    .stMetric {
        background-color: #ffffff;
        border: 1px solid #e0e7ff;
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s;
    }
    .stMetric:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        border-color: #3b82f6;
    }

    /* Headers */
    .main-title {
        background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
    }
    
    .section-header {
        color: #1e293b;
        font-weight: 600;
        font-size: 1.5rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        border-left: 4px solid #3b82f6;
        padding-left: 1rem;
    }

    /* Tables */
    [data-testid="stDataFrame"] {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: #f8fafc;
        border-right: 1px solid #e2e8f0;
    }
    
    /* Buttons */
    .stButton>button {
        border-radius: 8px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# --- SIDEBAR ---
with st.sidebar:
    st.markdown("## 🦷 AD&I Intelligence")
    st.markdown("**Market Strategist Agent 260206**")
    st.markdown("---")
    
    selected_page = st.radio(
        "Navigation", 
        ["Market Matrix", "Competitor Details", "Research Lab"],
        captions=["Competitive Landscape", "Deep Dive Data", "AI Analysis"]
    )
    
    st.markdown("### 📍 Location Scope")
    
    dma_options = ["Dallas DFW DMA", "Houston", "Austin", "San Antonio", "Other..."]
    dma_selection = st.selectbox("Select Market", dma_options)
    
    if dma_selection == "Other...":
        selected_dma = st.text_input("Enter Market Name (e.g. Phoenix, AZ)")
    else:
        selected_dma = dma_selection

    if selected_dma:
        st.success(f"Context: {selected_dma}")
    else:
        st.warning("Please select or enter a market.")

# --- PAGE 1: MARKET MATRIX ---
if selected_page == "Market Matrix":
    st.markdown(f'<div class="main-title">Competitive Market Matrix</div>', unsafe_allow_html=True)
    st.caption(f"Analyzing competitive density and pricing architecture for **{selected_dma}**")
    
    if not selected_dma:
        st.stop()

    with st.spinner(f"Agent 260206 is analyzing {selected_dma}..."):
        data = brain.get_market_matrix(selected_dma)
    
    if data:
        df = pd.DataFrame(data)
        
        # Data Cleaning for Visuals
        chart_df = df.copy()
        cols_to_clean = ['priceDenture', 'priceTier1Low', 'priceTier1High']
        for col in cols_to_clean:
            chart_df[col] = pd.to_numeric(chart_df[col], errors='coerce').fillna(0)

        # 1. High-Level KPI Cards
        st.markdown('<div class="section-header">Market Vitals</div>', unsafe_allow_html=True)
        k1, k2, k3, k4 = st.columns(4)
        
        with k1:
            st.metric("Competitive Set", len(df), delta_color="off")
        with k2:
            st.metric("Avg Clinics/DSO", round(df['clinicCount'].mean(), 1))
        with k3:
            total_surgeons = df['surgeonCount'].sum()
            st.metric("Implant Surgeons", total_surgeons, help="Total identified Oral Surgeons in competitive set")
        with k4:
            # Calc avg price ignoring 0s
            avg_price = chart_df[chart_df['priceDenture'] > 0]['priceDenture'].mean()
            st.metric("Avg Economy Denture", f"${avg_price:,.0f}")

        # 2. Main Data Table
        st.markdown('<div class="section-header">Level 1: Competitive Scan</div>', unsafe_allow_html=True)
        
        # Color highlighting for AD&I
        def highlight_adi(row):
            if "AD&I" in row['dsoName'] or "Affordable" in row['dsoName']:
                return ['background-color: #e0f2fe; color: #0c4a6e; font-weight: bold'] * len(row)
            return [''] * len(row)

        st.dataframe(
            df.style.apply(highlight_adi, axis=1),
            column_config={
                "dsoName": st.column_config.TextColumn("DSO / Practice", width="medium"),
                "geographicFocus": "Geo Focus",
                "clinicCount": st.column_config.NumberColumn("Clinics"),
                "dentistCount": st.column_config.NumberColumn("Dentists"),
                "dentistsPerClinic": st.column_config.NumberColumn("DDS/Clinic", format="%.2f"),
                "surgeonCount": st.column_config.NumberColumn("Surgeons"),
                "priceDenture": st.column_config.NumberColumn("Econ Denture", format="$%d"),
                "priceTier1Low": st.column_config.NumberColumn("Tier 1 (Low)", format="$%d"),
                "priceTier1High": st.column_config.NumberColumn("Tier 1 (High)", format="$%d"),
            },
            use_container_width=True,
            hide_index=True,
            height=500
        )

        # 3. Advanced Visualization
        st.markdown('<div class="section-header">Pricing Architecture</div>', unsafe_allow_html=True)
        
        melted_df = chart_df.melt(id_vars=['dsoName'], value_vars=['priceDenture', 'priceTier1Low', 'priceTier1High'], var_name='Tier', value_name='Price')
        
        # Custom mapping for cleaner legend names
        tier_names = {
            "priceDenture": "Economy Denture", 
            "priceTier1Low": "Tier 1 (Low)", 
            "priceTier1High": "Tier 1 (High)"
        }
        melted_df['Tier'] = melted_df['Tier'].map(tier_names)

        fig = px.bar(
            melted_df, 
            x='dsoName', 
            y='Price', 
            color='Tier', 
            barmode='group',
            color_discrete_map={
                "Economy Denture": "#93c5fd", # Light Blue
                "Tier 1 (Low)": "#3b82f6",    # Blue
                "Tier 1 (High)": "#1e40af"    # Dark Blue
            },
            height=500
        )
        
        fig.update_layout(
            plot_bgcolor='white',
            paper_bgcolor='white',
            font={'family': "Inter, sans-serif"},
            xaxis={'title': None, 'tickangle': -45},
            yaxis={'title': 'Price ($)', 'gridcolor': '#f1f5f9'},
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.error("No data available. Please check the market name.")

# --- PAGE 2: COMPETITOR DETAILS ---
elif selected_page == "Competitor Details":
    st.markdown(f'<div class="main-title">Competitor Deep Dive</div>', unsafe_allow_html=True)
    
    if not selected_dma:
        st.warning("Select a market in the sidebar first.")
        st.stop()

    with st.spinner("Loading Context..."):
        matrix_data = brain.get_market_matrix(selected_dma)
    
    dso_names = [d['dsoName'] for d in matrix_data]
    
    col_nav, col_main = st.columns([1, 3])
    
    with col_nav:
        st.markdown("### Select Competitor")
        selected_dso = st.radio("List", dso_names, label_visibility="collapsed")
        
        if selected_dso:
            sel_data = next((item for item in matrix_data if item["dsoName"] == selected_dso), None)
            if sel_data:
                st.info(f"""
                **Quick Stats**
                
                🏥 Clinics: {sel_data['clinicCount']}
                
                🦷 Dentists: {sel_data['dentistCount']}
                
                👨‍⚕️ Surgeons: {sel_data['surgeonCount']}
                """)

    with col_main:
        if selected_dso:
            st.markdown(f"## {selected_dso}")
            
            with st.spinner(f"Gathering intelligence on {selected_dso}..."):
                details = brain.get_competitor_details(selected_dma, selected_dso)
            
            # Pricing Visual
            sel_data = next((item for item in matrix_data if item["dsoName"] == selected_dso), None)
            if sel_data:
                 # Filter 0s for chart
                 p_items = []
                 if sel_data['priceDenture'] != 'TBD': p_items.append({'Label': 'Econ Denture', 'Price': sel_data['priceDenture']})
                 if sel_data['priceTier1Low'] != 'TBD': p_items.append({'Label': 'Tier 1 Low', 'Price': sel_data['priceTier1Low']})
                 if sel_data['priceTier1High'] != 'TBD': p_items.append({'Label': 'Tier 1 High', 'Price': sel_data['priceTier1High']})
                 
                 if p_items:
                     p_df = pd.DataFrame(p_items)
                     fig_p = px.bar(p_df, x="Price", y="Label", orientation='h', title="Price Points", text="Price")
                     fig_p.update_traces(marker_color='#3b82f6', texttemplate='$%{text:.0f}', textposition='outside')
                     fig_p.update_layout(
                         plot_bgcolor='white',
                         xaxis={'visible': False},
                         yaxis={'title': None}
                     )
                     st.plotly_chart(fig_p, use_container_width=True)

            # Lists
            st.markdown("### 🧬 Personnel Forensics")
            c1, c2 = st.columns(2)
            
            with c1:
                st.markdown("**Identified Dentists**")
                if details['dentistNames']:
                    for name in details['dentistNames']:
                        st.markdown(f"- 🦷 {name}")
                else:
                    st.caption("No public records found.")

            with c2:
                st.markdown("**Identified Surgeons**")
                if details['surgeonNames']:
                    for name in details['surgeonNames']:
                        st.markdown(f"- 💉 {name}")
                else:
                    st.caption("No public records found.")

            st.markdown("---")
            st.caption(f"**Source Trace:** {details.get('evidenceSource', 'AI Generated Estimation')}")

# --- PAGE 3: RESEARCH LAB ---
elif selected_page == "Research Lab":
    st.markdown(f'<div class="main-title">Field Research Lab</div>', unsafe_allow_html=True)
    st.info("💡 **Pro Tip:** Ask for specific trends like 'Why is Heartland cheaper in Tier 1?' or 'Generate a hypothesis on Aspen's strategy'.")

    # Chat UI
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"], avatar="🦷" if message["role"] == "assistant" else "👤"):
            st.markdown(message["content"])

    if prompt := st.chat_input("Ask Agent 260206..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user", avatar="👤"):
            st.markdown(prompt)

        with st.chat_message("assistant", avatar="🦷"):
            with st.spinner("Thinking..."):
                response = brain.chat(prompt)
            st.markdown(response)
        
        st.session_state.messages.append({"role": "assistant", "content": response})
