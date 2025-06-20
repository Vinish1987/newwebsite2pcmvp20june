
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp,
  Calendar,
  Coins,
  ArrowUpRight,
  Clock,
  DollarSign,
  Wallet
} from "lucide-react";
import Image from "next/image";

interface UserData {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  timestamp?: string;
}

interface DashboardData {
  totalInvested: number;
  interestEarned: number;
  nextPayoutDate: string;
  planType: string;
  currentValue: number;
  monthlyReturn: number;
  daysActive: number;
  expectedValue: number;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalInvested: 15000,
    interestEarned: 300,
    nextPayoutDate: "July 17, 2025",
    planType: "One-time Investment",
    currentValue: 15300,
    monthlyReturn: 2.0,
    daysActive: 30,
    expectedValue: 16800
  });
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user data on component mount (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, [isClient]);

  // Get dynamic investment data from payment submission (client-side only)
  useEffect(() => {
    if (!isClient) return;

    try {
      const paymentData = localStorage.getItem("paymentData");
      const paymentSubmissions = localStorage.getItem("paymentSubmissions");
      
      let investmentAmount = 15000; // Default fallback
      
      // Try to get actual investment amount from payment data
      if (paymentData) {
        const parsedPaymentData = JSON.parse(paymentData);
        investmentAmount = parsedPaymentData.amount || 15000;
      }
      
      // Or from payment submissions
      if (paymentSubmissions) {
        const submissions = JSON.parse(paymentSubmissions);
        if (submissions.length > 0) {
          // Get the latest submission
          const latestSubmission = submissions[submissions.length - 1];
          investmentAmount = latestSubmission.amount || investmentAmount;
        }
      }

      const interestEarned = Math.round(investmentAmount * 0.02); // 2% of investment
      const currentValue = investmentAmount + interestEarned;
      const expectedValue = Math.round(investmentAmount * 1.12); // 12% growth over 6 months

      setDashboardData({
        totalInvested: investmentAmount,
        interestEarned: interestEarned,
        nextPayoutDate: "July 17, 2025",
        planType: "One-time Investment",
        currentValue: currentValue,
        monthlyReturn: 2.0,
        daysActive: 30,
        expectedValue: expectedValue
      });
    } catch (error) {
      console.error("Error parsing payment data:", error);
    }
  }, [isClient]);

  // Get actual signup date from userData
  const getFormattedDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Calculate next interest receiving date (one month from signup)
  const getNextInterestDate = (timestamp?: string) => {
    if (!timestamp) {
      // Fallback to current date + 1 month if no timestamp
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
    
    const signupDate = new Date(timestamp);
    const nextInterestDate = new Date(signupDate);
    nextInterestDate.setMonth(nextInterestDate.getMonth() + 1);
    
    return nextInterestDate.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Use actual signup date for transactions
  const actualSignupDate = userData?.timestamp ? getFormattedDate(userData.timestamp) : new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Calculate next interest receiving date
  const nextInterestDate = getNextInterestDate(userData?.timestamp);

  const transactions = [
    {
      date: actualSignupDate,
      type: "investment",
      amount: dashboardData.totalInvested,
      description: "Initial Investment"
    },
    {
      date: actualSignupDate,
      type: "interest",
      amount: dashboardData.interestEarned,
      description: "Monthly Interest Update"
    }
  ];

  const handleWithdraw = async () => {
    if (!isClient) return;

    // Enhanced validation
    const withdrawalAmount = parseFloat(withdrawAmount);
    
    // Check if amount is valid
    if (!withdrawAmount || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      alert("Please enter a valid withdrawal amount greater than ₹0");
      return;
    }
    
    // Check minimum withdrawal amount
    if (withdrawalAmount < 100) {
      alert("Minimum withdrawal amount is ₹100");
      return;
    }
    
    // Check if amount exceeds available balance
    if (withdrawalAmount > dashboardData.currentValue) {
      alert(`Withdrawal amount (₹${withdrawalAmount.toLocaleString()}) cannot exceed your available balance of ₹${dashboardData.currentValue.toLocaleString()}`);
      return;
    }
    
    // Check if user has sufficient funds (additional buffer check)
    const minimumBalance = 50; // Keep minimum ₹50 in account
    if (withdrawalAmount > (dashboardData.currentValue - minimumBalance)) {
      alert(`You must maintain a minimum balance of ₹${minimumBalance}. Maximum withdrawal allowed: ₹${(dashboardData.currentValue - minimumBalance).toLocaleString()}`);
      return;
    }

    // Confirm withdrawal with user
    const confirmWithdrawal = window.confirm(
      `Are you sure you want to withdraw ₹${withdrawalAmount.toLocaleString()}?\n\n` +
      `Current Balance: ₹${dashboardData.currentValue.toLocaleString()}\n` +
      `After Withdrawal: ₹${(dashboardData.currentValue - withdrawalAmount).toLocaleString()}\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirmWithdrawal) {
      return;
    }

    setIsWithdrawing(true);

    try {
      // Store withdrawal request
      const withdrawalRequest = {
        amount: withdrawalAmount,
        timestamp: new Date().toISOString(),
        status: "pending",
        email: userData?.email,
        userName: userData?.fullName,
        previousBalance: dashboardData.currentValue,
        newBalance: dashboardData.currentValue - withdrawalAmount
      };
      
      const existingWithdrawals = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]");
      existingWithdrawals.push(withdrawalRequest);
      localStorage.setItem("withdrawalRequests", JSON.stringify(existingWithdrawals));

      // Send email notification to admin
      if (userData) {
        const emailNotificationData = {
          userEmail: userData.email,
          userName: userData.fullName,
          withdrawalAmount: withdrawalAmount,
          timestamp: withdrawalRequest.timestamp
        };

        // Call withdrawal email API
        const response = await fetch('/api/withdrawal-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailNotificationData),
        });

        if (response.ok) {
          console.log("Withdrawal email notification sent successfully");
        } else {
          console.error("Failed to send withdrawal email notification");
        }
      }
      
      alert(`Withdrawal request of ₹${withdrawalAmount.toLocaleString()} submitted successfully!\n\nMoney will be reflected in your account within 24 hours.\n\nReference ID: WD${Date.now()}`);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal request error:", error);
      alert("Something went wrong while processing your withdrawal request. Please try again or contact support.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const firstName = userData?.fullName?.split(" ")[0] || "User";

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-emerald-900/20 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-emerald-900/20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header with Logo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
        <div className="flex items-center justify-center p-4">
          <Image
            src="/asset-4-mc0qxufi.png"
            alt="2PC"
            width={60}
            height={24}
            className="h-6 w-auto"
            priority
          />
        </div>
      </div>

      {/* Main Content - Single Column Layout */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Hi {firstName} 👋, welcome back!
            </h1>
            <p className="text-lg sm:text-xl text-slate-300">
              Here's how your money's growing today.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Total Invested */}
            <Card className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <span className="text-slate-400 font-medium text-sm sm:text-base">Total Invested</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">₹{dashboardData.totalInvested.toLocaleString()}</p>
                <p className="text-emerald-400 text-xs sm:text-sm">Principal Amount</p>
              </CardContent>
            </Card>

            {/* Interest Earned */}
            <Card className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-purple-500/20 shadow-xl shadow-purple-500/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <span className="text-slate-400 font-medium text-sm sm:text-base">Interest Earned</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">₹{dashboardData.interestEarned.toLocaleString()}</p>
                <p className="text-purple-400 text-xs sm:text-sm">+{dashboardData.monthlyReturn}% Monthly</p>
              </CardContent>
            </Card>

            {/* Next Interest Receiving Date */}
            <Card className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-blue-500/20 shadow-xl shadow-blue-500/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <span className="text-slate-400 font-medium text-sm sm:text-base">Next Interest Receiving Date</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white mb-1">{nextInterestDate}</p>
                <p className="text-blue-400 text-xs sm:text-sm">Monthly Interest</p>
              </CardContent>
            </Card>

            {/* Plan Type */}
            <Card className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-orange-500/20 shadow-xl shadow-orange-500/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    <Target className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <span className="text-slate-400 font-medium text-sm sm:text-base">Plan Type</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white mb-1">One-time</p>
                <p className="text-orange-400 text-xs sm:text-sm">Lump Sum</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Timeline/Activity */}
            <Card className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  {transactions.map((transaction, index) => (
                    <div key={index} className="flex items-start gap-3 sm:gap-4">
                      <div className="relative">
                        <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "investment" 
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}>
                          {transaction.type === "investment" ? (
                            <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                          ) : (
                            <Coins className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                          )}
                        </div>
                        {index < transactions.length - 1 && (
                          <div className="absolute top-8 sm:top-10 left-1/2 transform -translate-x-1/2 w-px h-6 sm:h-8 bg-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white text-sm sm:text-base truncate">{transaction.description}</h4>
                          <span className={`font-bold text-sm sm:text-base ${
                            transaction.type === "investment" ? "text-emerald-400" : "text-purple-400"
                          }`}>
                            +₹{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-6 sm:mt-8 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-300 font-medium text-sm sm:text-base">Growth Progress</span>
                    <span className="text-emerald-400 font-bold text-sm sm:text-base">
                      ₹{dashboardData.currentValue.toLocaleString()} / ₹{dashboardData.expectedValue.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={(dashboardData.currentValue / dashboardData.expectedValue) * 100} 
                    className="h-2 sm:h-3 bg-slate-600"
                  />
                  <p className="text-slate-400 text-xs sm:text-sm mt-2">
                    {Math.round((dashboardData.currentValue / dashboardData.expectedValue) * 100)}% towards your goal
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Card */}
            <Card className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-500/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                  <ArrowUpRight className="w-4 sm:w-5 h-4 sm:h-5 text-red-400" />
                  Withdrawal Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm sm:text-base">Withdrawal Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setWithdrawAmount(value);
                      
                      // Real-time validation feedback
                      const amount = parseFloat(value);
                      if (value && !isNaN(amount) && amount > dashboardData.currentValue) {
                        e.target.style.borderColor = '#ef4444';
                        e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
                      } else {
                        e.target.style.borderColor = '';
                        e.target.style.boxShadow = '';
                      }
                    }}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500/20 focus:ring-2 h-11 sm:h-12"
                    max={dashboardData.currentValue}
                    min="100"
                    step="1"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <p className="text-slate-400">
                      Available: ₹{dashboardData.currentValue.toLocaleString()}
                    </p>
                    <p className="text-slate-500">
                      Min: ₹100
                    </p>
                  </div>
                  
                  {/* Quick amount buttons */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawAmount("1000")}
                      className="bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/50 text-xs px-2 py-1"
                    >
                      ₹1K
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawAmount("5000")}
                      className="bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/50 text-xs px-2 py-1"
                    >
                      ₹5K
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawAmount((dashboardData.currentValue - 50).toString())}
                      className="bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/50 text-xs px-2 py-1"
                      disabled={dashboardData.currentValue <= 100}
                    >
                      Max
                    </Button>
                  </div>
                  
                  {/* Validation message */}
                  {withdrawAmount && parseFloat(withdrawAmount) > dashboardData.currentValue && (
                    <p className="text-red-400 text-xs">
                      Amount exceeds available balance
                    </p>
                  )}
                  {withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) < 100 && (
                    <p className="text-yellow-400 text-xs">
                      Minimum withdrawal amount is ₹100
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleWithdraw}
                  disabled={
                    !withdrawAmount || 
                    parseFloat(withdrawAmount) <= 0 || 
                    parseFloat(withdrawAmount) < 100 ||
                    parseFloat(withdrawAmount) > dashboardData.currentValue || 
                    isWithdrawing
                  }
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {isWithdrawing ? "Processing..." : "Request Withdrawal"}
                </Button>

                <div className="text-center space-y-1">
                  <p className="text-slate-400 text-xs">
                    Money will be reflected in your account within 24 hours
                  </p>
                  <p className="text-slate-500 text-xs">
                    Processing fee: ₹5 | Secure & Encrypted
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
              For any issue please write us at vini12345@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
