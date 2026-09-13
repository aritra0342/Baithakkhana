import { Route, Routes } from 'react-router-dom';
import { Layout, Art } from './components';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import Detail from './pages/Detail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import About from './pages/About';
import ImageCredits from './pages/ImageCredits';
import AdminPage from './pages/AdminPage';

function CustomerApp() {
  return <Layout><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/menu" element={<MenuPage/>}/>
    <Route path="/menu/:category" element={<MenuPage/>}/>
    <Route path="/menu/item/:itemId" element={<Detail/>}/>
    <Route path="/cart" element={<Cart/>}/>
    <Route path="/checkout" element={<Checkout/>}/>
    <Route path="/order-success/:orderId" element={<Success/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/image-credits" element={<ImageCredits/>}/>
    <Route path="*" element={<div className="state-page"><Art kind="fish"/><h1>এই পাতাটি আড্ডায় নেই</h1><p>ঠিকানাটি হয়তো বদলে গেছে।</p><a className="button button-dark" href="/">ফিরে চলুন</a></div>}/>
  </Routes></Layout>;
}

export default function App() {
  return <Routes><Route path="/admin/*" element={<AdminPage/>}/><Route path="/*" element={<CustomerApp/>}/></Routes>;
}
