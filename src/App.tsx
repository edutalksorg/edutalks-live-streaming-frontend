import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Layouts
import SuperAdminLayout from './pages/SuperAdmin/SuperAdminLayout';
import AdminLayout from './pages/Admin/AdminLayout';
import InstructorLayout from './pages/Instructor/InstructorLayout';
import SuperInstructorLayout from './pages/Instructor/SuperInstructorLayout';
import StudentLayout from './pages/Student/StudentLayout';

// Components
import DashboardHome from './pages/SuperAdmin/DashboardHome';
import UserManagement from './pages/SuperAdmin/UserManagement';
import PaymentManagement from './pages/SuperAdmin/PaymentManagement';
import InstructorManagement from './pages/Instructor/InstructorManagement';
import BatchManagement from './pages/Instructor/BatchManagement';
import AdminDashboard from './pages/Admin/AdminDashboard';
import InstructorClasses from './pages/Instructor/InstructorClasses';
import InstructorExams from './pages/Instructor/InstructorExams';
import InstructorGrading from './pages/Instructor/InstructorGrading';
import InstructorNotes from './pages/Instructor/InstructorNotes';
import InstructorTournaments from './pages/Instructor/InstructorTournaments';
import LiveClassRoom from './pages/Instructor/LiveClassRoom';
import StudentClasses from './pages/Student/StudentClasses';
import StudentExamList from './pages/Student/StudentExamList';
import ExamRunner from './pages/Student/ExamRunner';
import StudentNotes from './pages/Student/StudentNotes';
import StudentTournaments from './pages/Student/StudentTournaments';
import StudentSubscription from './pages/Student/StudentSubscription';
import SuperInstructorDashboard from './pages/Instructor/SuperInstructorDashboard';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Super Admin */}
          <Route element={<PrivateRoute allowedRoles={['super_admin']} />}>
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="instructors" element={<div className="p-8">Instructors List Placeholder</div>} />
              <Route path="students" element={<div className="p-8">Students List Placeholder</div>} />
            </Route>
          </Route>

          {/* Super Instructor */}
          <Route element={<PrivateRoute allowedRoles={['super_instructor']} />}>
            <Route path="/super-instructor" element={<SuperInstructorLayout />}>
              <Route index element={<SuperInstructorDashboard />} />
              <Route path="instructors" element={<InstructorManagement />} />
              <Route path="batches" element={<BatchManagement />} />
              <Route path="classes" element={<InstructorClasses />} />
              <Route path="exams" element={<InstructorExams />} />
              <Route path="tournaments" element={<InstructorTournaments />} />
              <Route path="tournaments" element={<InstructorTournaments />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="live/:id" element={<LiveClassRoom />} />
            </Route>
          </Route>

          {/* Instructor */}
          <Route element={<PrivateRoute allowedRoles={['instructor']} />}>
            <Route path="/instructor" element={<InstructorLayout />}>
              <Route index element={<InstructorClasses />} />
              <Route path="live/:id" element={<LiveClassRoom />} />
              <Route path="students" element={<div className="p-8">Student List Placeholder</div>} />
              <Route path="exams" element={<InstructorExams />} />
              <Route path="exams/:id/grading" element={<InstructorGrading />} />
              <Route path="tournaments" element={<InstructorTournaments />} />
              <Route path="notes" element={<InstructorNotes />} />
            </Route>
          </Route>

          {/* Student */}
          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentClasses />} />
              <Route path="live/:id" element={<LiveClassRoom />} />
              <Route path="tests" element={<StudentExamList />} />
              <Route path="exam/:id" element={<ExamRunner />} />
              <Route path="tournaments" element={<StudentTournaments />} />
              <Route path="materials" element={<StudentNotes />} />
              <Route path="subscription" element={<StudentSubscription />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
