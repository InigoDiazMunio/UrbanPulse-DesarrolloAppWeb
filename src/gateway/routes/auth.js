const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'urbanpulse_secret_key_2024';

// Esquema de Usuario en MongoDB
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ✅ REGISTRO - Crear nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validaciones
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son obligatorios' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario o email ya existe' 
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 DETERMINAR ROL SEGÚN EMAIL
    const isUrbanPulseEmail = email.toLowerCase().endsWith('@urbanpulse.com');
    const userRole = isUrbanPulseEmail ? 'admin' : 'user';

    // Crear usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: userRole
    });

    await newUser.save();

    console.log(`✅ Usuario registrado: ${username} (email: ${email}, rol: ${userRole})`);

    res.status(201).json({ 
      success: true, 
      message: isUrbanPulseEmail 
        ? '🎉 Usuario registrado con privilegios de administrador' 
        : 'Usuario registrado exitosamente',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// ✅ LOGIN - Autenticar usuario
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son obligatorios' 
      });
    }

    // Buscar usuario
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Generar JWT con el rol
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Login exitoso: ${username} (email: ${user.email}, rol: ${user.role})`);

    res.json({ 
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// ✅ VERIFICAR TOKEN
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
});

// ✅ OBTENER PERFIL
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    res.json({ 
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
});

// ✅ LISTAR TODOS LOS USUARIOS (solo admin)
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario es admin
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Solo administradores.' 
      });
    }

    // Obtener todos los usuarios
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.json({ 
      success: true,
      users
    });

  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// ✅ CAMBIAR ROL DE USUARIO (solo admin)
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { userId } = req.params;
    const { role } = req.body;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario es admin
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Solo administradores.' 
      });
    }

    // No permitir que el admin se quite sus propios privilegios
    if (userId === decoded.userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'No puedes cambiar tu propio rol' 
      });
    }

    // Validar rol
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rol inválido' 
      });
    }

    // Actualizar rol
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    console.log(`✅ Rol actualizado: ${updatedUser.username} → ${role}`);

    res.json({ 
      success: true,
      message: `Rol actualizado a ${role}`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// ✅ ELIMINAR USUARIO (solo admin)
router.delete('/users/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { userId } = req.params;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario es admin
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Solo administradores.' 
      });
    }

    // No permitir que el admin se elimine a sí mismo
    if (userId === decoded.userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'No puedes eliminar tu propia cuenta' 
      });
    }

    // Eliminar usuario
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    console.log(`✅ Usuario eliminado: ${deletedUser.username}`);

    res.json({ 
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

module.exports = router;

module.exports = router;