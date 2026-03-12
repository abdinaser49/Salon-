import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, X, Check, Sparkles, Phone, CreditCard, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Services with price and duration
const services = [
  { name: "Hair Styling", price: 85, duration: "60–120 min", icon: "✂️", description: "Cut, color & blowout by master stylists", color: "from-violet-500/10 to-purple-500/10", border: "border-violet-200/50" },
  { name: "Nail Artistry", price: 55, duration: "45–90 min", icon: "💅", description: "Manicure, pedicure & bespoke nail art", color: "from-rose-500/10 to-pink-500/10", border: "border-rose-200/50" },
  { name: "Facial Treatments", price: 120, duration: "60–90 min", icon: "🌿", description: "Rejuvenating facials with premium products", color: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-200/50" },
  { name: "Body & Massage", price: 100, duration: "60–120 min", icon: "🌺", description: "Deep tissue, hot stone & aromatherapy", color: "from-amber-500/10 to-orange-500/10", border: "border-amber-200/50" },
];

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

// EVC Plus USSD payment number
const PAYMENT_MERCHANT = "614498649";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
}

const BookingModal = ({ isOpen, onClose, preselectedService }: BookingModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Beauty");
  const [selectedService, setSelectedService] = useState(
    services.find(s => s.name === preselectedService) || services[0]
  );
  const [selectedEmployee, setSelectedEmployee] = useState("Any");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("8:00 am");
  const [endTime, setEndTime] = useState("8:00 am");
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
    }
  }, [user]);

  const resetAndClose = () => {
    setStep(1);
    onClose();
  };

  const steps = [
    { id: 1, label: "Time" },
    { id: 2, label: "Service" },
    { id: 3, label: "Details" },
    { id: 4, label: "Payment" },
    { id: 5, label: "Done" },
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleConfirm = async () => {
    const bookingData = {
      client_id: user?.id,
      name: name,
      phone: phone,
      service: selectedService.name,
      booking_date: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      booking_time: startTime,
      status: "Pending Confirmation",
      amount: selectedService.price,
    };

    try {
      const { data, error } = await supabase.from('bookings').insert([bookingData]).select();
      if (error) throw error;
      setStep(5);
      toast.success("Appointment booked!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col font-sans text-slate-700">
        
        {/* Stepper Header */}
        <div className="flex w-full border-b">
          {steps.map((s) => (
            <div 
              key={s.id}
              className={cn(
                "flex-1 flex items-center justify-center py-4 gap-3 border-r last:border-r-0 transition-colors",
                step === s.id ? "bg-[#00bcd4] text-white" : "bg-[#f8f9fa] text-slate-400"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                step === s.id ? "bg-white/20" : "bg-slate-200"
              )}>
                {s.id}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-8">
                <h3 className="text-lg font-bold text-slate-800">Please select service:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Category</label>
                    <select 
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#00bcd4] outline-none"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option>Beauty</option>
                      <option>Hair</option>
                      <option>Nails</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Service</label>
                    <select 
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#00bcd4] outline-none"
                      value={selectedService?.name}
                      onChange={(e) => setSelectedService(services.find(s => s.name === e.target.value) || services[0])}
                    >
                      {services.map(s => <option key={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Employee</label>
                    <select 
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#00bcd4] outline-none"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                      <option>Any</option>
                      <option>Deeqa Axmed</option>
                      <option>Layla Cali</option>
                      <option>Hodan Maxamed</option>
                      <option>Sahra Cabdi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">I'm available on or after</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left p-3 border rounded hover:bg-slate-50 flex justify-between items-center">
                          {date ? format(date, "PPP") : "Select Date"}
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Start from</label>
                    <select className="w-full p-3 border rounded focus:ring-2 focus:ring-[#00bcd4] outline-none" value={startTime} onChange={e => setStartTime(e.target.value)}>
                      {timeSlots.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Finish by</label>
                    <select className="w-full p-3 border rounded focus:ring-2 focus:ring-[#00bcd4] outline-none" value={endTime} onChange={e => setEndTime(e.target.value)}>
                      {timeSlots.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Confirm Service Selection</h3>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                   <div className="flex justify-between mb-4">
                      <span className="text-slate-500">Selected Treatment</span>
                      <span className="font-bold text-[#00bcd4]">{selectedService.name}</span>
                   </div>
                   <div className="flex justify-between mb-4">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-medium">{selectedService.duration}</span>
                   </div>
                   <div className="flex justify-between text-xl font-bold pt-4 border-t">
                      <span>Price</span>
                      <span className="text-slate-900">${selectedService.price}</span>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Your Details:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Full Name</label>
                    <input type="text" className="w-full p-3 border rounded focus:ring-2 focus:ring-[#00bcd4] outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">Phone Number</label>
                    <input type="tel" className="w-full p-3 border rounded focus:ring-2 focus:ring-[#00bcd4] outline-none" value={phone} onChange={e => setPhone(e.target.value)} placeholder="061XXXXXXX" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Payment Confirmation</h3>
                <p className="text-slate-500 text-center max-w-md">Please complete the payment of <strong>${selectedService.price}</strong> to confirm your appointment.</p>
                <div className="w-full max-w-sm bg-slate-950 text-white p-6 rounded-xl space-y-4">
                   <div className="flex justify-between text-sm opacity-60">
                      <span>Merchant</span>
                      <span>EVC Plus</span>
                   </div>
                   <div className="text-center text-3xl font-mono tracking-wider py-2">
                      {PAYMENT_MERCHANT}
                   </div>
                   <button onClick={() => setPaid(true)} className={cn("w-full py-4 rounded font-bold uppercase tracking-widest", paid ? "bg-emerald-500" : "bg-primary")}>
                      {paid ? "Payment Verified" : "I have paid"}
                   </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="flex flex-col items-center py-10">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <Check className="w-10 h-10 stroke-[3px]" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Done!</h3>
                <p className="text-slate-500 mb-8">Thank you! Your booking is complete.</p>
                <div className="w-full max-w-sm border rounded-xl overflow-hidden mb-8">
                   <div className="bg-slate-50 p-4 border-b">
                      <p className="text-xs font-bold uppercase text-slate-400">Appointment Details</p>
                   </div>
                   <div className="p-4 space-y-3 text-sm">
                      <div className="flex justify-between"><span>Service</span><span className="font-bold">{selectedService.name}</span></div>
                      <div className="flex justify-between"><span>Date</span><span className="font-bold">{format(date, "PPP")}</span></div>
                      <div className="flex justify-between"><span>Time</span><span className="font-bold">{startTime}</span></div>
                   </div>
                </div>
                <button onClick={resetAndClose} className="bg-[#00bcd4] text-white px-12 py-3 rounded-full font-bold shadow-lg hover:shadow-[#00bcd4]/30 transition-shadow">
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Buttons */}
        {step < 5 && (
          <div className="p-8 border-t bg-[#fdfdfd] flex justify-between items-center">
            <button 
              onClick={handleBack}
              disabled={step === 1}
              className="bg-[#00bcd4] text-white px-10 py-3 rounded text-sm font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0097a7] transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={step === 4 ? handleConfirm : handleNext}
              className="bg-[#e91e63] text-white px-10 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-[#c2185b] transition-colors"
            >
              {step === 4 ? "Complete" : "Next"}
            </button>
          </div>
        )}
        
        {/* Close button X */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors sm:hidden"
        >
          <X className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

export default BookingModal;
