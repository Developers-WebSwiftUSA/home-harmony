import { useState } from "react";
import { Calendar, Clock, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AnimatedCalendar from "./AnimatedCalendar";
import AnimatedTimePicker from "./AnimatedTimePicker";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { tourService } from "@/services/tour.service";
import { toast } from "sonner";
import { Property } from "@/types/models";
import { cn } from "@/lib/utils";
import { toLocalDateString } from "@/lib/tourDate";

interface TourBookingModalProps {
  open: boolean;
  onClose: () => void;
  property: Property;
  onSuccess?: () => void;
}

const TourBookingModal = ({ open, onClose, property, onSuccess }: TourBookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<{ startTime: string; endTime: string } | null>(null);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"date" | "time" | "message">("date");

  // Fetch availability for selected date
  const { data: availabilityData } = useQuery({
    queryKey: ["tour-availability", property._id, selectedDate ? toLocalDateString(selectedDate) : null],
    queryFn: () => {
      if (!selectedDate) return Promise.resolve({ success: true, data: [] });
      return tourService.availability(property._id, toLocalDateString(selectedDate));
    },
    enabled: !!selectedDate && step === "time",
  });

  const availableSlots = availabilityData?.data || [];

  const bookingMutation = useMutation({
    mutationFn: () => {
      if (!selectedDate || !selectedTime) {
        throw new Error("Please select a date and time");
      }
      return tourService.create({
        propertyId: property._id,
        date: toLocalDateString(selectedDate),
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
        message: message.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Tour booking requested successfully!");
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to book tour");
    },
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep("time");
  };

  const handleTimeSelect = (startTime: string, endTime: string) => {
    setSelectedTime({ startTime, endTime });
    setStep("message");
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setMessage("");
    setStep("date");
    onClose();
  };

  const handleSubmit = () => {
    bookingMutation.mutate();
  };

  const canProceed = () => {
    if (step === "date") return !!selectedDate;
    if (step === "time") return !!selectedTime;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            Book a Tour
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Property Info */}
          <div className="bg-muted rounded-lg p-4 border border-border">
            <h3 className="font-heading font-bold text-foreground mb-2">{property.title}</h3>
            <p className="text-sm text-muted-foreground">
              {property.location?.address}, {property.location?.city}, {property.location?.state}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            {["date", "time", "message"].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    step === s
                      ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                      : index < ["date", "time", "message"].indexOf(step)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={cn(
                      "w-12 h-1 transition-all duration-300",
                      index < ["date", "time", "message"].indexOf(step)
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === "date" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">Select a date for your tour</span>
                </div>
                <AnimatedCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  minDate={new Date()}
                />
              </div>
            )}

            {step === "time" && selectedDate && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">
                    Select a time slot for {selectedDate.toLocaleDateString()}
                  </span>
                </div>
                <AnimatedTimePicker
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  availableSlots={availableSlots}
                />
              </div>
            )}

            {step === "message" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Add a message (optional)</span>
                </div>
                <Textarea
                  placeholder="Any special requests or questions about the property..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="text-sm font-medium text-foreground mb-2">Tour Summary</div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {selectedDate?.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {selectedTime?.startTime} - {selectedTime?.endTime}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                if (step === "time") setStep("date");
                else if (step === "message") setStep("time");
                else handleClose();
              }}
            >
              {step === "date" ? "Cancel" : "Back"}
            </Button>

            {step === "message" ? (
              <Button
                onClick={handleSubmit}
                disabled={bookingMutation.isPending}
                className="gap-2"
              >
                {bookingMutation.isPending ? (
                  "Booking..."
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Confirm Booking
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (step === "date" && selectedDate) setStep("time");
                  else if (step === "time" && selectedTime) setStep("message");
                }}
                disabled={!canProceed()}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TourBookingModal;
