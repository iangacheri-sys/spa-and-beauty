export default function Slide7Pricing() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#FAF7F4",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "5.5vh 8vw",
        boxSizing: "border-box",
      }}
    >
      {/* Accent shapes */}
      <div
        style={{
          position: "absolute",
          top: "8vh",
          right: "9vw",
          width: "2.5vw",
          height: "2.5vw",
          borderRadius: "50%",
          backgroundColor: "#C9956A",
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "13vh",
          left: "4vw",
          width: "5vw",
          height: "5vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
          opacity: 0.06,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "45vh",
          left: "3.5vw",
          width: "1.1vw",
          height: "1.1vw",
          borderRadius: "0.2vw",
          backgroundColor: "#C9956A",
          opacity: 0.5,
          transform: "rotate(45deg)",
        }}
      />

      {/* Header */}
      <div style={{ zIndex: 10, marginBottom: "4vh" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5vw",
            padding: "0.5vh 1vw",
            backgroundColor: "rgba(181, 112, 127, 0.12)",
            borderRadius: "2vw",
            marginBottom: "2vh",
          }}
        >
          <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#B5707F", borderRadius: "50%" }} />
          <span style={{ fontSize: "0.9vw", fontWeight: 600, color: "#B5707F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Pricing
          </span>
        </div>
        <h2
          style={{
            fontSize: "3.8vw",
            fontWeight: 800,
            color: "#1A1210",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          KES 1,200 – 4,500
          <span style={{ color: "#B5707F" }}>.</span>
        </h2>
      </div>

      {/* Service rows — 6 items in 2 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.8vh 4vw",
          flex: 1,
          alignContent: "start",
          zIndex: 10,
        }}
      >
        {/* Express Facial */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1.5vh", borderBottom: "1px solid rgba(26,18,16,0.07)" }}>
          <div>
            <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Express Facial</p>
            <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: "0.3vh 0 0 0" }}>30 min</p>
          </div>
          <p style={{ fontSize: "1.5vw", fontWeight: 800, color: "#B5707F", margin: 0 }}>KES 1,500</p>
        </div>
        {/* Signature Facial */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1.5vh", borderBottom: "1px solid rgba(26,18,16,0.07)" }}>
          <div>
            <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Signature Facial</p>
            <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: "0.3vh 0 0 0" }}>60 min</p>
          </div>
          <p style={{ fontSize: "1.5vw", fontWeight: 800, color: "#B5707F", margin: 0 }}>KES 2,500</p>
        </div>
        {/* Hot Stone Massage */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1.5vh", borderBottom: "1px solid rgba(26,18,16,0.07)" }}>
          <div>
            <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Hot Stone Massage</p>
            <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: "0.3vh 0 0 0" }}>60 min</p>
          </div>
          <p style={{ fontSize: "1.5vw", fontWeight: 800, color: "#C9956A", margin: 0 }}>KES 3,000</p>
        </div>
        {/* Deep Tissue Massage */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1.5vh", borderBottom: "1px solid rgba(26,18,16,0.07)" }}>
          <div>
            <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Deep Tissue Massage</p>
            <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: "0.3vh 0 0 0" }}>90 min</p>
          </div>
          <p style={{ fontSize: "1.5vw", fontWeight: 800, color: "#C9956A", margin: 0 }}>KES 3,500</p>
        </div>
        {/* Body Wrap */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1.5vh", borderBottom: "1px solid rgba(26,18,16,0.07)" }}>
          <div>
            <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Hydrating Body Wrap</p>
            <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: "0.3vh 0 0 0" }}>90 min</p>
          </div>
          <p style={{ fontSize: "1.5vw", fontWeight: 800, color: "#B5707F", margin: 0 }}>KES 3,800</p>
        </div>
        {/* Keratin Treatment */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "1.5vh",
            borderBottom: "1px solid rgba(26,18,16,0.07)",
            backgroundColor: "rgba(181,112,127,0.06)",
            borderRadius: "0.8vw",
            padding: "1.2vh 1.2vw",
          }}
        >
          <div>
            <p style={{ fontSize: "1.4vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Keratin Treatment</p>
            <p style={{ fontSize: "1.15vw", color: "#7D5C5C", margin: "0.3vh 0 0 0" }}>120 min · Most popular</p>
          </div>
          <p style={{ fontSize: "1.6vw", fontWeight: 800, color: "#B5707F", margin: 0 }}>KES 4,500</p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.85vw",
          color: "#9B7B7B",
          fontWeight: 500,
          zIndex: 10,
          borderTop: "1px solid rgba(26,18,16,0.07)",
          paddingTop: "2vh",
          marginTop: "3vh",
        }}
      >
        <div style={{ display: "flex", gap: "2vw" }}>
          <span>Spa &amp; Beauty App</span>
          <span>/</span>
          <span>Product Overview</span>
        </div>
        <div style={{ fontWeight: 700, color: "#1A1210" }}>07</div>
      </div>
    </div>
  );
}
