import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Requires admin role' });
  next();
};




app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: role || 'STUDENT' }
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});


app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        submissions: true,
      }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching assignments' });
  }
});


app.post('/api/assignments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, dueDate, onedriveLink } = req.body;
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        onedriveLink,
        createdById: req.user.id
      }
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating assignment' });
  }
});


app.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    
    
    const allMemberIds = [...new Set([...memberIds, req.user.id])];

    const group = await prisma.group.create({
      data: {
        name,
        createdById: req.user.id,
        members: {
          create: allMemberIds.map(id => ({ userId: id }))
        }
      },
      include: {
        members: {
          include: { user: true }
        }
      }
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Error creating group' });
  }
});


app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: { userId: req.user.id }
        }
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        submissions: true
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching groups' });
  }
});


app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, email: true }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching students' });
  }
});


app.post('/api/submissions', authenticateToken, async (req, res) => {
  try {
    const { assignmentId, groupId } = req.body;
    
    
    const groupMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: req.user.id }
    });
    
    if (!groupMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_groupId: {
          assignmentId,
          groupId
        }
      },
      update: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      create: {
        assignmentId,
        groupId,
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Error submitting assignment' });
  }
});


app.get('/api/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalAssignments = await prisma.assignment.count();
    const totalGroups = await prisma.group.count();
    const totalSubmissions = await prisma.submission.count({
      where: { status: 'SUBMITTED' }
    });
    
    const recentSubmissions = await prisma.submission.findMany({
      where: { status: 'SUBMITTED' },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      include: {
        group: true,
        assignment: true
      }
    });
    
    res.json({
      totalAssignments,
      totalGroups,
      totalSubmissions,
      recentSubmissions
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
