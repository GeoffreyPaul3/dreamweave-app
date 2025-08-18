
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, User, LogOut, Settings, Package, Store, Menu, X, Home, ShoppingBag, MessageCircleCodeIcon } from 'lucide-react';
import { useAmazonCart } from '@/contexts/AmazonCartContext';
import logo from "@/assets/dreamwave-logo.png"

const Header = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state: cartState } = useAmazonCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
      await signOut();
      navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isAmazonRoute = location.pathname.startsWith('/amazon');

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
           <img 
             src={logo}
             alt="Dream Weave Logo"
             width={100}
             height={100}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') && !isAmazonRoute
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/amazon"
              className={`text-sm font-medium transition-colors ${
                isAmazonRoute
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
               Dubai Store
            </Link>
            {isAmazonRoute && (
              <Link
                to="/amazon/cart"
                className="text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart ({cartState.totalItems})
              </Link>
            )}
            <Link
              to="/categories"
              className={`text-sm font-medium transition-colors ${
                isActive('/categories')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Categories
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Cart Badge for Mobile */}
            {isAmazonRoute && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/amazon/cart')}
                className="lg:hidden flex items-center gap-1"
              >
                <ShoppingCart className="w-5 h-5" />
                <Badge variant="secondary" className="ml-1">
                  {cartState.totalItems}
                </Badge>
              </Button>
            )}

            {user ? (
              <>
                {/* Desktop Buttons */}
                <div className="hidden lg:flex items-center space-x-2">
                  {/* Amazon Orders Link */}
                  {isAmazonRoute && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/amazon/orders')}
                      className="flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Button>
                  )}

                  {/* Marketplace Dashboard Link */}
                  {!isAmazonRoute && (
                <Button 
                  variant="outline" 
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center gap-2"
                >
                      <Store className="w-4 h-4" />
                      Dashboard
                </Button>
                  )}

                  {/* Admin Dashboard Links */}
                  {isAdmin && (
                    <>
                      {!isAmazonRoute && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/admin')}
                          className="flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Admin
                        </Button>
                      )}
                      {isAmazonRoute && (
                <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/amazon/admin')}
                          className="flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Amazon Admin
                </Button>
                      )}
                    </>
                  )}
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                        <AvatarFallback>
                          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(isAdmin ? (isAmazonRoute ? '/amazon/admin' : '/admin') : '/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{isAdmin ? 'Admin Dashboard' : 'Profile'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <MessageCircleCodeIcon className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Store Switcher */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Switch Store</h3>
                    <div className="space-y-2">
                      <Button
                        variant={!isAmazonRoute ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/')}
                      >
                        <Home className="w-4 h-4 mr-3" />
                        Marketplace
                      </Button>
                      <Button
                        variant={isAmazonRoute ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/amazon')}
                      >
                        <ShoppingBag className="w-4 h-4 mr-3" />
                        Dream Weave Dubai Store
                      </Button>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Navigation</h3>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/categories')}
                      >
                        Categories
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/about')}
                      >
                        About
                      </Button>
                    </div>
                  </div>

                  {/* User Actions */}
                  {user ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">Account</h3>
                      <div className="space-y-2">
                        {isAmazonRoute && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleNavigation('/amazon/orders')}
                          >
                            <Package className="w-4 h-4 mr-3" />
                            My Orders
                          </Button>
                        )}
                        {!isAmazonRoute && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleNavigation(isAdmin ? '/admin' : '/dashboard')}
                          >
                            <Store className="w-4 h-4 mr-3" />
                            {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                          </Button>
                        )}
                        {isAdmin && (
                          <>
                            {!isAmazonRoute && (
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleNavigation('/admin')}
                              >
                                <Settings className="w-4 h-4 mr-3" />
                                Admin
                              </Button>
                            )}
                            {isAmazonRoute && (
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleNavigation('/amazon/admin')}
                              >
                                <Settings className="w-4 h-4 mr-3" />
                                Amazon Admin
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigation('/messages')}
                        >
                          <MessageCircleCodeIcon className="w-4 h-4 mr-3" />
                          Messages
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          onClick={() => {
                            handleSignOut();
                            closeMobileMenu();
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Log out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">Authentication</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleNavigation('/auth')}
                        >
                          Sign In
                        </Button>
                        <Button
                          className="w-full"
                          onClick={() => handleNavigation('/auth')}
                        >
                          Sign Up
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  {user && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                          <AvatarFallback>
                            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
