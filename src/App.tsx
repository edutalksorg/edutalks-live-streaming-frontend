import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Layouts
import SuperAdminLayout from './pages/SuperAdmin/SuperAdminLayout';
import AdminLayout from './pages/Admin/AdminLayout';
import InstructorLayout from './pages/Instructor/InstructorLayout';
import SuperInstructorLayout from './pages/SuperInstructor/SuperInstructorLayout';
import StudentLayout from './pages/Student/StudentLayout';

// Components
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import UserManagement from './pages/SuperAdmin/UserManagement';
import PaymentManagement from './pages/SuperAdmin/PaymentManagement';
import InstructorManagement from './pages/Instructor/InstructorManagement';
import BatchManagement from './pages/Instructor/BatchManagement';
import AdminDashboard from './pages/Admin/AdminDashboard';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import InstructorClasses from './pages/Instructor/InstructorClasses';
import InstructorExams from './pages/Instructor/InstructorExams';
import InstructorGrading from './pages/Instructor/InstructorGrading';
import InstructorNotes from './pages/Instructor/InstructorNotes';
import InstructorTournaments from './pages/Instructor/InstructorTournaments';
import InstructorStudents from './pages/Instructor/InstructorStudents';
import LiveClassRoom from './pages/Instructor/LiveClassRoom';
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentProfile from './pages/Student/StudentProfile';
import StudentClasses from './pages/Student/StudentClasses';
import StudentExamList from './pages/Student/StudentExamList';
import ExamRunner from './pages/Student/ExamRunner';
import StudentNotes from './pages/Student/StudentNotes';
import StudentTournaments from './pages/Student/StudentTournaments';
import StudentSubscription from './pages/Student/StudentSubscription';
import SuperInstructorDashboard from './pages/SuperInstructor/SuperInstructorDashboard';
import SuperInstructorUsers from './pages/SuperInstructor/SuperInstructorUsers';
import SuperInstructorAllocation from './pages/SuperInstructor/SuperInstructorAllocation';
import StudentExamResult from './pages/Student/StudentExamResult';


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
              <Route index element={<SuperAdminDashboard />} />
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
              <Route path="users" element={<SuperInstructorUsers />} />
              <Route path="allocation" element={<SuperInstructorAllocation />} />
              <Route path="live/:id" element={<LiveClassRoom />} />
            </Route>
          </Route>

          {/* Instructor */}
          <Route element={<PrivateRoute allowedRoles={['instructor']} />}>
            <Route path="/instructor" element={<InstructorLayout />}>
              <Route index element={<InstructorDashboard />} />
              <Route path="classes" element={<InstructorClasses />} />
              <Route path="live/:id" element={<LiveClassRoom />} />
              <Route path="students" element={<InstructorStudents />} />
              <Route path="exams" element={<InstructorExams />} />
              <Route path="exams/:id/grading" element={<InstructorGrading />} />
              <Route path="tournaments" element={<InstructorTournaments />} />
              <Route path="notes" element={<InstructorNotes />} />
            </Route>
          </Route>

          {/* Student */}
          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="classes" element={<StudentClasses />} />
              <Route path="live/:id" element={<LiveClassRoom />} />
              <Route path="tests" element={<StudentExamList />} />
              <Route path="exam/:id" element={<ExamRunner />} />
              <Route path="exam-result/:submissionId" element={<StudentExamResult />} />
              <Route path="tournaments" element={<StudentTournaments />} />
              <Route path="materials" element={<StudentNotes />} />
              <Route path="subscription" element={<StudentSubscription />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
