import { useState } from "react";
import { useReviews } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageCircle, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Reviews() {
  const { data: reviews = [], isLoading, refetch } = useReviews();
  const { toast } = useToast();
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <div className="flex h-[200px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerReply: replyText })
      });
      toast({ title: 'Reply posted successfully' });
      setReplyingTo(null);
      setReplyText("");
      refetch();
    } catch (err) {
      toast({ title: 'Failed to post reply', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = async (reviewId: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentStatus })
      });
      toast({ title: 'Visibility updated' });
      refetch();
    } catch (err) {
      toast({ title: 'Failed to update visibility', variant: 'destructive' });
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Positive</Badge>;
      case 'negative': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Negative</Badge>;
      case 'neutral': return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Neutral</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
        <p className="text-muted-foreground mt-1 text-sm">Monitor and respond to customer feedback.</p>
      </div>

      {reviews.length === 0 ? (
        <Card className="bg-white/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium">No reviews yet</p>
            <p className="text-sm text-muted-foreground">When customers leave reviews, they'll appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className={`bg-white/80 backdrop-blur ${!review.isVisible ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  
                  {/* Left Side: Review Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="font-semibold text-lg">{review.author.name}</span>
                      <span className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>

                    {review.title && <h3 className="font-semibold">{review.title}</h3>}
                    <p className="text-gray-700">{review.body}</p>

                    <div className="flex items-center gap-2 mt-2">
                      {review.aiModerated && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                          <ShieldCheck className="w-3 h-3" /> AI Moderated
                        </div>
                      )}
                      {getSentimentBadge(review.aiSentiment)}
                    </div>

                    {/* Owner Reply Section */}
                    {review.ownerReply ? (
                      <div className="mt-4 bg-secondary/50 p-4 rounded-lg border border-border">
                        <p className="text-xs font-semibold text-primary mb-1">Your Reply:</p>
                        <p className="text-sm text-gray-700">{review.ownerReply}</p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {replyingTo === review.id ? (
                          <div className="space-y-3">
                            <Textarea 
                              placeholder="Write your response to the customer..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="bg-white"
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleReplySubmit(review.id)}
                                disabled={isSubmitting || !replyText.trim()}
                              >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Post Reply
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setReplyingTo(review.id)}>
                            <MessageCircle className="w-4 h-4 mr-2" /> Reply
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex flex-col items-end gap-2 border-l border-border pl-4">
                    <div className="text-right mb-4">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                      <Badge variant={review.isVisible ? "default" : "secondary"}>
                        {review.isVisible ? 'Public' : 'Hidden'}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={review.isVisible ? "text-amber-600 hover:text-amber-700" : "text-green-600 hover:text-green-700"}
                      onClick={() => toggleVisibility(review.id, review.isVisible)}
                    >
                      {review.isVisible ? (
                        <><AlertTriangle className="w-4 h-4 mr-2" /> Hide Review</>
                      ) : (
                        <><ShieldCheck className="w-4 h-4 mr-2" /> Make Public</>
                      )}
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
