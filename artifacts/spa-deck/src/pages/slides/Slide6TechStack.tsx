export default function Slide6TechStack() {
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
          top: "-10vw",
          left: "-6vw",
          width: "35vw",
          height: "35vw",
          borderRadius: "50%",
          backgroundColor: "#C9956A",
          opacity: 0.14,
          filter: "blur(5vw)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "14vh",
          right: "8vw",
          width: "2vw",
          height: "2vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20vh",
          right: "38vw",
          width: "1.4vw",
          height: "1.4vw",
          borderRadius: "0.2vw",
          backgroundColor: "#C9956A",
          transform: "rotate(45deg)",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, marginBottom: "5vh" }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5vw",
              padding: "0.5vh 1.2vw",
              backgroundColor: "rgba(201,149,106,0.15)",
              borderRadius: "2vw",
              marginBottom: "2vh",
            }}
          >
            <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#C9956A", borderRadius: "50%" }} />
            <span style={{ fontSize: "0.9vw", fontWeight: 600, color: "#C9956A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tech Stack
            </span>
          </div>
          <h2
            style={{
              fontSize: "3.8vw",
              fontWeight: 800,
              color: "white",
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Built with
            <span style={{ color: "#C9956A" }}>.</span>
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#C9956A", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Spa &amp; Beauty</div>
        </div>
      </div>

      {/* Stack grid: 2x2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "2.5vh 3vw",
          flex: 1,
          zIndex: 10,
        }}
      >
        {/* React Native Expo */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "1.2vw",
            padding: "3vh 2.5vw",
            borderTop: "0.3vh solid #B5707F",
          }}
        >
          <p style={{ fontSize: "0.9vw", fontWeight: 600, color: "#B5707F", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.5vh 0" }}>Cross-Platform</p>
          <p style={{ fontSize: "2vw", fontWeight: 800, color: "white", margin: "0 0 1vh 0", letterSpacing: "-0.02em" }}>React Native (Expo)</p>
          <p style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: 400 }}>iOS, Android, and Web from one codebase</p>
        </div>

        {/* AsyncStorage */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "1.2vw",
            padding: "3vh 2.5vw",
            borderTop: "0.3vh solid #C9956A",
          }}
        >
          <p style={{ fontSize: "0.9vw", fontWeight: 600, color: "#C9956A", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.5vh 0" }}>Storage</p>
          <p style={{ fontSize: "2vw", fontWeight: 800, color: "white", margin: "0 0 1vh 0", letterSpacing: "-0.02em" }}>AsyncStorage</p>
          <p style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: 400 }}>Offline-first booking persistence on device</p>
        </div>

        {/* Expo Router */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "1.2vw",
            padding: "3vh 2.5vw",
            borderTop: "0.3vh solid #B5707F",
          }}
        >
          <p style={{ fontSize: "0.9vw", fontWeight: 600, color: "#B5707F", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.5vh 0" }}>Navigation</p>
          <p style={{ fontSize: "2vw", fontWeight: 800, color: "white", margin: "0 0 1vh 0", letterSpacing: "-0.02em" }}>Expo Router</p>
          <p style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: 400 }}>File-based navigation with deep linking</p>
        </div>

        {/* TypeScript */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "1.2vw",
            padding: "3vh 2.5vw",
            borderTop: "0.3vh solid #C9956A",
          }}
        >
          <p style={{ fontSize: "0.9vw", fontWeight: 600, color: "#C9956A", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.5vh 0" }}>Language</p>
          <p style={{ fontSize: "2vw", fontWeight: 800, color: "white", margin: "0 0 1vh 0", letterSpacing: "-0.02em" }}>TypeScript</p>
          <p style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: 400 }}>Type-safe across the entire codebase</p>
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
          marginTop: "3vh",
        }}
      >
        <div style={{ display: "flex", gap: "2vw" }}>
          <span>Spa &amp; Beauty App</span>
          <span>/</span>
          <span>Product Overview</span>
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>06</div>
      </div>
    </div>
  );
}
