import React, { useState } from "react";
import { Zap, Crown, Rocket, Star, X, Check } from "lucide-react";

export const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const features = [
    { name: "🔥 Giá bán", basic: "199K / tháng", pro: "499K / 3 tháng", premium: "1.699K / năm", proNote: "(giảm 16%)", premiumNote: "→ Tặng thêm 6 tháng" },
    { name: "️️🎬 Số video/ngày", basic: "3", pro: "6", premium: "9" },
    { name: "📋 Lên lịch trước tối đa", basic: "7 ngày", pro: "14 ngày", premium: "21 ngày" },
    { name: "💾 Số video có thể lưu cùng lúc", basic: "30", pro: "60", premium: "90" },
    { name: "📍 Dung lượng lưu trữ khuyến nghị", basic: "5GB", pro: "10GB", premium: "15GB" },
    { name: "🗑️ Tự động xóa video sau đăng", basic: "7 ngày", pro: "7 ngày", premium: "7 ngày" },
    { name: "👥 Tổng số tài khoản MXH", basic: "5", pro: "8", premium: "12", note: "(Fanpage, Reels, Instagram, YouTube)" },
    { name: "👨‍👩‍👧‍👦 Thêm thành viên quản lý", basic: "❌", pro: "+1 thành viên", premium: "+2 thành viên" },
    { name: "🤖 Hỗ trợ AI viết nội dung", basic: "✅ Full: mô tả + hashtag + tiêu đề", pro: "✅ Full", premium: "✅ Full" },
    { name: "☁️ Lưu trữ trên", basic: "Đám mây", pro: "Đám mây", premium: "Đám mây" }
  ];

  const plans = [
    {
      name: "CƠ BẢN",
      icon: <Zap className="text-blue-600" size={24} />,
      price: "199K",
      period: "/ tháng",
      description: "Hoàn hảo cho cá nhân",
      color: "border-blue-200",
      bgColor: "bg-gradient-to-br from-blue-50 via-white to-blue-100",
      textColor: "text-blue-900",
      buttonColor: "bg-blue-600 text-white hover:bg-blue-700",
      popular: false
    },
    {
      name: "TIẾT KIỆM",
      icon: <Crown className="text-purple-600" size={24} />,
      price: "499K",
      period: "/ 3 tháng",
      description: "Tốt nhất cho doanh nghiệp nhỏ",
      color: "border-purple-500",
      bgColor: "bg-gradient-to-br from-purple-50 via-white to-pink-100",
      textColor: "text-purple-900",
      buttonColor: "bg-purple-600 text-white hover:bg-purple-700",
      popular: true,
      discount: "Giảm 16%"
    },
    {
      name: "CHUYÊN NGHIÊP",
      icon: <Rocket className="text-green-600" size={24} />,
      price: "1.699K",
      period: "/ năm",
      description: "Cho các agency và doanh nghiệp",
      color: "border-green-500",
      bgColor: "bg-gradient-to-br from-green-50 via-white to-green-100",
      textColor: "text-green-900",
      buttonColor: "bg-green-600 text-white hover:bg-green-700",
      popular: false,
      bonus: "Tặng thêm 6 tháng"
    }
  ];

  const getValue = (feature: any, planIndex: number) => {
    switch (planIndex) {
      case 0: return feature.basic;
      case 1: return feature.pro;
      case 2: return feature.premium;
      default: return feature.name;
    }
  };

  const renderValue = (value: string, feature: any, planIndex: number) => {
    if (value === "❌") {
      return <div className="flex justify-center"><X className="text-red-500" size={20} /></div>;
    }
    if (value.includes("✅")) {
      return <div className="text-center"><Check className="text-green-500 mx-auto mb-1" size={20} /><span className="text-xs text-gray-600">{value.replace("✅ ", "")}</span></div>;
    }
    if (feature.name === "🔥 Giá bán") {
      return <div className="text-center"><div className="font-bold text-lg">{value}</div>{planIndex === 1 && feature.proNote && <div className="text-xs text-purple-600 font-medium">{feature.proNote}</div>}{planIndex === 2 && feature.premiumNote && <div className="text-xs text-green-600 font-medium">{feature.premiumNote}</div>}</div>;
    }
    return <div className="text-center font-medium">{value}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">🌟 BẢNG GIÁ DỊCH VỤ ĐĂNG BÀI & LƯU TRỮ</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Chọn gói phù hợp với nhu cầu của bạn. Tất cả gói đều hướng đến việc tối ưu hóa quy trình đăng bài và lưu trữ video phục vụ cho công việc của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div key={index} className={`relative rounded-3xl border-2 ${plan.color} shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-xl overflow-hidden ${plan.bgColor} ${plan.popular ? 'ring-4 ring-purple-300' : ''}`}>
              <div className="p-8 pt-12 flex flex-col justify-between h-full">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">{plan.icon}<h3 className={`text-2xl font-bold ${plan.textColor}`}>{plan.name}</h3></div>
                  <div className="mb-4"><span className={`text-4xl font-bold ${plan.textColor}`}>{plan.price}</span><span className="text-gray-600 text-lg">{plan.period}</span></div>
                  {(plan.discount || plan.bonus) && (
                    <div className={`text-sm font-bold mb-2 rounded-full px-3 py-1 inline-block shadow-sm animate-wiggle hover:animate-none transition-all duration-300
                      ${plan.discount ? 'bg-purple-100 text-purple-600' : ''} 
                      ${plan.bonus ? 'bg-green-100 text-green-600' : ''}`}>
                      {plan.discount || plan.bonus}
                    </div>
                  )}
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <button className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:brightness-110 shadow-md ${plan.buttonColor}`}>Chọn gói này</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-100 via-blue-100 to-purple-100 border-b border-gray-300 shadow-sm">
            <div className="grid grid-cols-4 gap-0">
              <div className="p-6 border-r border-gray-200">
                <div className="flex items-center gap-2"><Star className="text-gray-600" size={20} /><h3 className="text-lg font-bold text-gray-900">TÍNH NĂNG</h3></div>
              </div>
              {plans.map((plan, index) => (
                <div key={index} className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">{plan.icon}<h3 className={`text-lg font-bold ${plan.textColor}`}>{plan.name}</h3></div>
                </div>
              ))}
            </div>
          </div>
          {features.map((feature, featureIndex) => (
            <div key={featureIndex} className={`grid grid-cols-4 gap-0 ${featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-blue-100 transition duration-200`}>
              <div className="p-4 border-r border-gray-200">
                <div className="font-semibold text-gray-900 flex items-center gap-2">{feature.name}</div>
                {feature.note && <div className="text-xs text-gray-500 italic mt-1">{feature.note}</div>}
              </div>
              {plans.map((plan, planIndex) => (
                <div key={planIndex} className="p-4 flex items-center justify-center min-h-[4rem]">
                  {renderValue(getValue(feature, planIndex), feature, planIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
