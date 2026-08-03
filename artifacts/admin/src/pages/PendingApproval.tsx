import { Link } from "wouter";
import { Clock, CheckCircle2, XCircle, LogOut, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface PendingApprovalProps {
  status?: string;
}

export default function PendingApproval({ status = "PENDING" }: PendingApprovalProps) {
  const { user, logout } = useAuth();

  const isRejected = status === "REJECTED";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, hsl(270,60%,96%) 0%, hsl(215,80%,96%) 50%, hsl(160,60%,96%) 100%)" }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white text-2xl font-black mb-4 shadow-lg shadow-primary/30">
            B
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Beauty Booker</h1>
          <p className="text-muted-foreground mt-1 text-sm">Partner Portal</p>
        </div>

        {/* Status Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-8 text-center space-y-5">
          {isRejected ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mx-auto">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Application Rejected</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Unfortunately your spa application was not approved at this time. Please contact our support team for more information.
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm space-y-2">
                <p className="text-red-700 font-medium">Need help?</p>
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <Phone className="w-4 h-4" />
                  <span>+254 700 000 000</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <Mail className="w-4 h-4" />
                  <span>support@beautybooker.co.ke</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mx-auto">
                <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Application Under Review</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Hi <strong>{user?.name}</strong>, your spa application is currently being reviewed by our team. 
                  You'll be notified once a decision is made.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Application Submitted</p>
                    <p className="text-xs text-muted-foreground">Your details have been received</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">Under Review</p>
                    <p className="text-xs text-muted-foreground">Platform team is reviewing your application</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dashboard Access Granted</p>
                    <p className="text-xs text-muted-foreground">Your spa goes live on the platform</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                Typical review time is <strong>1–2 business days</strong>. We'll send you a notification.
              </div>
            </>
          )}

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
