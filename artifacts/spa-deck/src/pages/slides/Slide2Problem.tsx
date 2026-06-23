export default function Slide2Problem() {
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
          top: "-12vw",
          right: "-6vw",
          width: "38vw",
          height: "38vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
          opacity: 0.18,
          filter: "blur(5vw)",
        }}
      />
      {/* Small accents */}
      <div
        style={{
          position: "absolute",
          bottom: "16vh",
          left: "7vw",
          width: "2.2vw",
          height: "2.2vw",
          borderRadius: "50%",
          backgroundColor: "#C9956A",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "22vh",
          left: "38vw",
          width: "1.5vw",
          height: "1.5vw",
          borderRadius: "0.2vw",
          backgroundColor: "#B5707F",
          transform: "rotate(45deg)",
        }}
      />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
          <div
            style={{
              width: "1.5vw",
              height: "1.5vw",
              backgroundColor: "#C9956A",
              borderRadius: "0.3vw",
            }}
          />
          <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
            Spa &amp; Beauty
          </div>
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
            The Problem
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", zIndex: 10, gap: "6vw" }}>
        {/* Left: headline */}
        <div style={{ width: "38vw" }}>
          <h1
            style={{
              fontSize: "5.5vw",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "white",
              margin: "0 0 3vh 0",
              letterSpacing: "-0.03em",
            }}
          >
            Bookings still run on WhatsApp
            <span style={{ color: "#B5707F" }}>.</span>
          </h1>
          <div style={{ width: "4vw", height: "0.3vh", backgroundColor: "#C9956A" }} />
        </div>

        {/* Right: pain points */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
          {/* Point 1 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "1vw",
              padding: "2.5vh 2.5vw",
              borderLeft: "0.35vw solid #B5707F",
            }}
          >
            <p style={{ fontSize: "1.6vw", fontWeight: 700, color: "white", margin: 0 }}>No central booking channel</p>
            <p style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)", margin: "0.8vh 0 0 0", fontWeight: 400 }}>
              Salons rely on calls and WhatsApp messages to manage appointments.
            </p>
          </div>
          {/* Point 2 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "1vw",
              padding: "2.5vh 2.5vw",
              borderLeft: "0.35vw solid #C9956A",
            }}
          >
            <p style={{ fontSize: "1.6vw", fontWeight: 700, color: "white", margin: 0 }}>No availability visibility</p>
            <p style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)", margin: "0.8vh 0 0 0", fontWeight: 400 }}>
              Clients cannot browse services, check specialist availability, or plan ahead.
            </p>
          </div>
          {/* Point 3 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "1vw",
              padding: "2.5vh 2.5vw",
              borderLeft: "0.35vw solid #B5707F",
            }}
          >
            <p style={{ fontSize: "1.6vw", fontWeight: 700, color: "white", margin: 0 }}>Missed appointments cost revenue</p>
            <p style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)", margin: "0.8vh 0 0 0", fontWeight: 400 }}>
              Double-bookings and no-shows hurt salon income with no system to prevent them.
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
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>02</div>
      </div>
    </div>
  );
}
