import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Share2, 
  Users, 
  Calendar, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Star,
  Globe,
  Smartphone,
  BarChart3,
  Shield,
  Clock,
  Target,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { PlatformIcon } from '../components/PlatformIcon';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Users className="text-blue-600" size={24} />,
      title: "Quản lý nhiều tài khoản",
      description: "Kết nối không giới hạn tài khoản trên tất cả nền tảng mạng xã hội với tùy chỉnh tên và phân loại linh hoạt."
    },
    {
      icon: <Calendar className="text-purple-600" size={24} />,
      title: "Lên lịch thông minh",
      description: "Lên lịch bài đăng trên mọi nền tảng với thời gian tối ưu và khả năng đăng tự động."
    },
    {
      icon: <Sparkles className="text-pink-600" size={24} />,
      title: "Tạo nội dung bằng AI",
      description: "Tạo nội dung hấp dẫn với AI tiên tiến, hỗ trợ tùy chỉnh theo từng nền tảng và yêu cầu riêng."
    },
    {
      icon: <BarChart3 className="text-green-600" size={24} />,
      title: "Phân tích & Thống kê",
      description: "Theo dõi hiệu suất trên tất cả nền tảng với dữ liệu phân tích chi tiết và chỉ số tương tác."
    },
    {
      icon: <Shield className="text-red-600" size={24} />,
      title: "Bảo mật & riêng tư",
      description: "Dữ liệu của bạn được mã hóa và lưu trữ cục bộ. Chúng tôi không bao giờ truy cập thông tin cá nhân của bạn."
    },
    {
      icon: <Zap className="text-yellow-600" size={24} />,
      title: "Tốc độ vượt trội",
      description: "Tối ưu hóa cho tốc độ với khả năng đăng tức thì và đồng bộ hóa theo thời gian thực trên các nền tảng."
    }
  ];

  const platforms = [
    { id: 'facebook', name: "Facebook" },
    { id: 'instagram', name: "Instagram" },
    { id: 'youtube', name: "YouTube" },
    { id: 'twitter', name: "Twitter" },
    { id: 'linkedin', name: "LinkedIn" },
    { id: 'tiktok', name: "TikTok" }
  ];

  const stats = [
    { number: "50K+", label: "Bài viết được tạo ra", icon: <Share2 size={20} /> },
    { number: "1M+", label: "Người dùng", icon: <TrendingUp size={20} /> },
    { number: "99.9%", label: "Thời gian hoạt động", icon: <Clock size={20} /> },
    { number: "24/7", label: "Hỗ trợ", icon: <Shield size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-6">
                <Sparkles size={16} />
                Được hỗ trợ bởi công nghệ AI mới nhất
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Quản lý tất cả
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> mạng xã hội</span>
              <br />của bạn trong một ứng dụng
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Kết nối tài khoản không giới hạn, tạo nội dung hấp dẫn bằng AI, lên lịch đăng bài trên mọi nền tảng
            và phát triển với bảng điều khiển hợp nhất.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/posts"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
              >
                Bắt đầu miễn phí
                <ArrowRight size={20} />
              </Link>
              
              <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <Play size={20} className="text-blue-600" />
                </div>
                Xem Demo
              </button>
            </div>

            {/* Platform Icons */}
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <span className="text-gray-500 font-medium">Hỗ trợ đa nền tảng:</span>
              {platforms.map((platform, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <PlatformIcon platformId={platform.id} size={24} variant="gradient" animated={true} />
                  <span className="font-medium text-gray-700 hidden sm:block">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Mọi thứ bạn cần để
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> thành công</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Các tính năng mạnh mẽ giúp đơn giản hóa quy trình làm việc trên mạng xã hội và tối đa hóa phạm vi tiếp cận của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phần Cách Thức Hoạt Động */}
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Bắt đầu với
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 3 bước đơn giản</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Từ thiết lập đến bài đăng đầu tiên chỉ trong vài phút. Không cần kiến thức kỹ thuật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Kết nối tài khoản</h3>
              <p className="text-gray-600 leading-relaxed">
                Liên kết các tài khoản mạng xã hội bằng mã API bảo mật. Hỗ trợ tất cả nền tảng chính và không giới hạn số tài khoản.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tạo nội dung</h3>
              <p className="text-gray-600 leading-relaxed">
                Viết bài, tải lên hình ảnh hoặc sử dụng AI để tạo nội dung hấp dẫn được tối ưu cho từng nền tảng.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500 to-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Đăng & lên lịch</h3>
              <p className="text-gray-600 leading-relaxed">
                Đăng bài ngay lập tức hoặc đặt lịch để hệ thống tự động đăng vào thời điểm tối ưu nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Phần Cảm Nhận Khách Hàng */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Được tin dùng bởi
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> người sáng tạo nội dung</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tham gia cùng hàng ngàn người sáng tạo, doanh nghiệp và influencer đang tin dùng Social Media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              name: "Tuấn Khang",
              role: "Người sáng tạo nội dung",
              avatar: "👨‍🚀",
              rating: 5,
              text: "Social Media đã thay đổi toàn bộ quy trình làm nội dung của tôi. Giờ tôi có thể quản lý hơn 15 tài khoản dễ dàng và tăng tương tác lên 300%!"
            }, {
              name: "Hà Linh",
              role: "Youtuber",
              avatar: "👩‍💼",
              rating: 5,
              text: "Tính năng tạo nội dung bằng AI thật tuyệt vời. Giúp tôi tiết kiệm hàng giờ mỗi tuần với chất lượng nội dung rất cao."
            }, {
              name: "Thành Đạt",
              role: "Chủ doanh nghiệp nhỏ",
              avatar: "👨‍💼",
              rating: 5,
              text: "Cuối cùng cũng có công cụ thật sự hiệu quả! Riêng tính năng lên lịch đã giúp tôi tiết kiệm hơn 10 giờ mỗi tuần. Rất đáng dùng!"
            }].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phần Kêu Gọi Hành Động */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn sàng thay đổi chiến lược
            <br />mạng xã hội của bạn?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Tham gia cùng hàng ngàn người sáng tạo và doanh nghiệp đã tối ưu quy trình mạng xã hội với Social Media.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/posts"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            >
              Bắt đầu miễn phí hôm nay
              <ArrowRight size={20} />
            </Link>

            <Link
              to="/pricing"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Xem bảng giá
            </Link>
          </div>

          <p className="text-blue-100 text-sm mt-6">
          Có gói miễn phí • Hủy bất kỳ lúc nào
          </p>
        </div>
      </section>
    </div>
  );
};