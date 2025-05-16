import { useState } from 'react';
import axios from 'axios';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer', // or 'rider'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users', formData);
      console.log('User registered:', response.data);
      // optionally redirect or show success
    } catch (error) {
      console.error('Signup failed:', error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" placeholder="Name" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <input name="phone" type="text" placeholder="Phone" onChange={handleChange} required />
      <select name="role" onChange={handleChange}>
        <option value="customer">Customer</option>
        <option value="rider">Rider</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;
