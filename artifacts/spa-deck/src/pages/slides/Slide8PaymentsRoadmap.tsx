const base = import.meta.env.BASE_URL;

export default function Slide8PaymentsRoadmap() {
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
        boxSizing: "border-box",
      }}
    >
      {/* Accent shapes */}
      <div
        style={{
          position: "absolute",
          top: "8vh",
          right: "9vw",
          width: "2.2vw",
          height: "2.2vw",
          borderRadius: "50%",
          backgroundColor: "#C9956A",
          opacity: 0.18,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "14vh",
          left: "4vw",
          width: "5vw",
          height: "5vw",
          borderRadius: "50%",
          backgroundColor: "#B5707F",
          opacity: 0.06,
        }}
      />

      {/* Left content */}
      <div
        style={{
          width: "52vw",
          padding: "6.5vh 8vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          zIndex: 10,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5vw",
              padding: "0.5vh 1vw",
              backgroundColor: "rgba(181, 112, 127, 0.12)",
              borderRadius: "2vw",
              marginBottom: "2.5vh",
            }}
          >
            <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#B5707F", borderRadius: "50%" }} />
            <span style={{ fontSize: "0.9vw", fontWeight: 600, color: "#B5707F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Payments Roadmap
            </span>
          </div>
          <h2
            style={{
              fontSize: "3.8vw",
              fontWeight: 800,
              color: "#1A1210",
              margin: "0 0 4vh 0",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Three phases to full payment
            <span style={{ color: "#B5707F" }}>.</span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
            {/* Phase 1 */}
            <div style={{ display: "flex", gap: "1.5vw", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "3vw",
                  height: "3vw",
                  borderRadius: "50%",
                  backgroundColor: "#B5707F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.2vw", fontWeight: 800, color: "white" }}>1</span>
              </div>
              <div>
                <p style={{ fontSize: "1.45vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Booking &amp; scheduling — live now</p>
                <p style={{ fontSize: "1.2vw", color: "#7D5C5C", margin: "0.4vh 0 0 0", fontWeight: 400 }}>Full booking flow, specialist selection, and appointment management.</p>
              </div>
            </div>
            {/* Phase 2 */}
            <div style={{ display: "flex", gap: "1.5vw", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "3vw",
                  height: "3vw",
                  borderRadius: "50%",
                  backgroundColor: "#C9956A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.2vw", fontWeight: 800, color: "white" }}>2</span>
              </div>
              <div>
                <p style={{ fontSize: "1.45vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>M-Pesa STK Push — next up</p>
                <p style={{ fontSize: "1.2vw", color: "#7D5C5C", margin: "0.4vh 0 0 0", fontWeight: 400 }}>Pay at confirmation with Safaricom M-Pesa via the Daraja API.</p>
              </div>
            </div>
            {/* Phase 3 */}
            <div style={{ display: "flex", gap: "1.5vw", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "3vw",
                  height: "3vw",
                  borderRadius: "50%",
                  backgroundColor: "rgba(26,18,16,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.2vw", fontWeight: 800, color: "#7D5C5C" }}>3</span>
              </div>
              <div>
                <p style={{ fontSize: "1.45vw", fontWeight: 700, color: "#1A1210", margin: 0 }}>Card payments + deposits</p>
                <p style={{ fontSize: "1.2vw", color: "#7D5C5C", margin: "0.4vh 0 0 0", fontWeight: 400 }}>Card checkout and booking deposits to reduce no-shows.</p>
              </div>
            </div>
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
            borderTop: "1px solid rgba(26,18,16,0.07)",
            paddingTop: "2vh",
          }}
        >
          <div style={{ display: "flex", gap: "2vw" }}>
            <span>Spa &amp; Beauty App</span>
            <span>/</span>
            <span>Product Overview</span>
          </div>
          <div style={{ fontWeight: 700, color: "#1A1210" }}>08</div>
        </div>
      </div>

      {/* Right: illustration */}
      <div
        style={{
          flex: 1,
          height: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "36vw",
            height: "36vw",
            backgroundColor: "rgba(201,149,106,0.07)",
            borderRadius: "50%",
            right: "-8vw",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <img
          src={`${base}illust-mpesa.png`}
          crossOrigin="anonymous"
          alt="M-Pesa illustration"
          style={{
            width: "70%",
            height: "auto",
            objectFit: "contain",
            zIndex: 2,
            position: "relative",
          }}
        />
      </div>
    </div>
  );
}
