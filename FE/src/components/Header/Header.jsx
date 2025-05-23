import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import userIcon from "../../assets/icons/svgs/userIcon.svg";
import cartIcon from "../../assets/icons/svgs/cartIcon.svg";
import searchIcon from "../../assets/icons/svgs/searchIcon.svg";
import barIcon from "../../assets/icons/svgs/bar.svg";
import closeIcon from "../../assets/icons/svgs/close.svg";
import bannerGucci from "../../assets/icons/images/cagob.png";
import Cart from "../Cart/Cart";
import FixedHeader from "./FixedHeader";
import Search from "../Search/Search";
import { useAppContext } from "../../Context/AppContext";

function MyHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    setIsAuthenticated,
    cart,
    setCart,
    isSidebarOpen,
    setIsSidebarOpen,
    isMenuOpen,
    setIsMenuOpen,
    isSearchOpen,
    setIsSearchOpen,
    handleLogout, // Sử dụng handleLogout từ AppContext
  } = useAppContext();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    if (token) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch("http://localhost:8080/cago/cart/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setCart([]);
        navigate("/auth");
        return;
      }

      const data = await response.json();
      if (data.status === "success") {
        const validSizes = ["S", "M", "L"];
        const parsedCart = (data.data.items || []).map((item) => ({
          ...item,
          cartId: parseInt(item.cartId),
          productId: parseInt(item.productId),
          size: validSizes.includes(item.size) ? item.size : "M",
          productImage: item.productImage
            ? `http://localhost:8080${item.productImage}`
            : null,
        }));
        setCart(parsedCart);
      } else {
        console.error("Failed to fetch cart:", data.message);
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your cart");
      setIsMenuOpen(false);
      navigate("/auth");
      return;
    }
    setIsSidebarOpen(true);
  };

  const handleSignInClick = () => {
    setIsMenuOpen(false);
    navigate("/auth");
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false); // Đóng menu trước khi đăng xuất
    handleLogout(); // Gọi handleLogout từ AppContext
  };

  const isHomepage = location.pathname === "/";

  return (
    <>
      {isHomepage && (
        <header className={styles.header}>
          <h1 className={styles.headerTitle} onClick={() => navigate("/")}>
            CARGO 
          </h1>
          <div className={styles.iconBox}>
            {!isAuthenticated && (
              <img
                src={userIcon}
                alt="User Icon"
                className={styles.headerIcon}
                onClick={handleSignInClick}
              />
            )}
            <div className={styles.cartContainer} onClick={handleCartClick}>
              <img
                src={cartIcon}
                alt="Cart Icon"
                className={styles.headerIcon}
              />
              {cart.length > 0 && (
                <span className={styles.cartCount}>{cart.length}</span>
              )}
            </div>
            <img
              src={searchIcon}
              alt="Search Icon"
              className={styles.headerIcon}
              onClick={toggleSearch}
            />
            <img
              src={barIcon}
              alt="Menu Icon"
              className={styles.headerIcon}
              onClick={() => setIsMenuOpen(true)}
            />
          </div>
          {isSearchOpen && !isScrolled && (
            <Search
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
            />
          )}
        </header>
      )}

      <FixedHeader />

      <div className={styles.banner}>
        <img src={bannerGucci} className={styles.bannerImage} alt="Banner" />
        <div className={styles.bannerOverlay}>
          <h1 className={styles.bannerTitle}>CAGO</h1>
        </div>
      </div>

      <div
        className={`${styles.overlay} ${
          isSidebarOpen || isMenuOpen ? styles.show : ""
        }`}
        onClick={closeSidebar}
        style={{
          opacity: isSidebarOpen || isMenuOpen ? 1 : 0,
          visibility: isSidebarOpen || isMenuOpen ? "visible" : "hidden",
        }}
      ></div>

      <Cart
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        cart={cart}
        setCart={setCart}
        handleUpdateQuantity={() => {}}
        handleRemoveItem={() => {}}
        fetchCart={fetchCart}
        navigate={navigate}
      />

      <div className={`${styles.sidebarMenu} ${isMenuOpen ? styles.open : ""}`}>
        <button
          className={styles.closeBtn}
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={closeIcon} alt="Close" />
        </button>
        <ul className={styles.menuList}>
          <li onClick={() => {
            setIsMenuOpen(false)
            navigate("/category/all")
          }}>Shop</li>
          <li onClick={() => {
            setIsMenuOpen(false)
          navigate("/stores")}}>Store System</li>
          <li>Voucher</li>
          {!isAuthenticated ? (
            <li onClick={handleSignInClick}>Sign In</li>
          ) : (
            <li onClick={handleLogoutClick}>Logout</li> // Sử dụng handleLogoutClick
          )}
          <li
            onClick={() => {
              if (isAuthenticated) {
                navigate("/profile");
              } else {
                toast.error("Please log in to view your profile");
                setIsMenuOpen(false);
                navigate("/auth");
              }
              setIsMenuOpen(false);
            }}
          >
            My Account
          </li>
          <li onClick={() => {
             setIsMenuOpen(false)
            navigate("/orders")
          }}>My Orders</li>
        </ul>
      </div>
    </>
  );
}

export default MyHeader;