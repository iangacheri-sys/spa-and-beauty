export default function Slide9WhatsNext() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#1A1210",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "6vh 8vw",
        boxSizing: "border-box",
        color: "white",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-14vw",
          right: "-6vw",
          width: "42vw",
          height: "42vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
          opacity: 0.2,
          filter: "blur(5vw)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12vh",
          left: "7vw",
          width: "2.5vw",
          height: "2.5vw",
          borderRadius: "50%",
          backgroundColor: "#C9956A",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "22vh",
          left: "42vw",
          width: "1.5vw",
          height: "1.5vw",
          borderRadius: "0.2vw",
          backgroundColor: "#B5707F",
          transform: "rotate(45deg)",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, marginBottom: "5vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#B5707F", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Spa &amp; Beauty</div>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5vw",
            padding: "0.5vh 1.2vw",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: "2vw",
          }}
        >
          <span style={{ fontSize: "0.9vw", fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            What's Next
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", gap: "6vw", alignItems: "center", zIndex: 10 }}>
        {/* Left: headline */}
        <div style={{ width: "36vw" }}>
          <h1
            style={{
              fontSize: "5.2vw",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "white",
              margin: "0 0 3vh 0",
              letterSpacing: "-0.03em",
            }}
          >
            Four things coming next
            <span style={{ color: "#C9956A" }}>.</span>
          </h1>
          <div style={{ width: "4vw", height: "0.3vh", backgroundColor: "#B5707F" }} />
        </div>

        {/* Right: roadmap items */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1.5vw",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: "1vw",
              padding: "2vh 2vw",
            }}
          >
            <div style={{ width: "2vw", height: "0.35vh", backgroundColor: "#B5707F", marginTop: "1.2vh", flexShrink: 0 }} />
            <p style={{ fontSize: "1.45vw", color: "white", margin: 0, fontWeight: 500 }}>
              M-Pesa payment integration via Safaricom Daraja API
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1.5vw",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: "1vw",
              padding: "2vh 2vw",
            }}
          >
            <div style={{ width: "2vw", height: "0.35vh", backgroundColor: "#C9956A", marginTop: "1.2vh", flexShrink: 0 }} />
            <p style={{ fontSize: "1.45vw", color: "white", margin: 0, fontWeight: 500 }}>
              Push notifications for appointment reminders
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1.5vw",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: "1vw",
              padding: "2vh 2vw",
            }}
          >
            <div style={{ width: "2vw", height: "0.35vh", backgroundColor: "#B5707F", marginTop: "1.2vh", flexShrink: 0 }} />
            <p style={{ fontSize: "1.45vw", color: "white", margin: 0, fontWeight: 500 }}>
              Loyalty points and repeat-client rewards
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1.5vw",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: "1vw",
              padding: "2vh 2vw",
            }}
          >
            <div style={{ width: "2vw", height: "0.35vh", backgroundColor: "#C9956A", marginTop: "1.2vh", flexShrink: 0 }} />
            <p style={{ fontSize: "1.45vw", color: "white", margin: 0, fontWeight: 500 }}>
              Staff scheduling dashboard for salon owners
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.85vw",
          color: "#6B5050",
          fontWeight: 500,
          zIndex: 10,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "2vh",
        }}
      >
        <div style={{ display: "flex", gap: "2vw" }}>
          <span>Spa &amp; Beauty App</span>
          <span>/</span>
          <span>Product Overview</span>
          <span>/</span>
          <span>2026</span>
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>09</div>
      </div>
    </div>
  );
}
