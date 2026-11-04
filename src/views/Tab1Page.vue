
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Student Grade</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- FORM -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            {{ isEditing ? 'Update Student' : 'Add Student' }}
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-item>
            <ion-input
              v-model="studentName"
              label="Student Name"
              label-placement="floating"
              placeholder="Enter student name"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="email"
              type="email"
              label="Email Address"
              label-placement="floating"
              placeholder="Enter email"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="course"
              label="Course"
              label-placement="floating"
              placeholder="Enter course"
            />
          </ion-item>

          <ion-button
            expand="block"
            class="ion-margin-top"
            @click="saveStudent"
            :disabled="loading"
          >
            {{ isEditing ? 'Update Student' : 'Add Student' }}
          </ion-button>

          <ion-button
            v-if="isEditing"
            expand="block"
            color="medium"
            fill="outline"
            @click="clearForm"
          >
            Cancel
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- STUDENT LIST -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Student List</ion-card-title>
          <ion-card-subtitle>
            Total Students: {{ students.length }}
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>

          <div v-if="loading">
            Loading records...
          </div>

          <div v-else-if="students.length === 0">
            No student records found.
          </div>

          <ion-list v-else>
            <ion-item
              v-for="student in students"
              :key="student.id"
            >
              <ion-label>
                <h2><strong>{{ student.name }}</strong></h2>
                <p>{{ student.email }}</p>
                <p>{{ student.course }}</p>
              </ion-label>

              <ion-button
                slot="end"
                fill="clear"
                color="primary"
                @click="editStudent(student)"
              >
                Edit
              </ion-button>

              <ion-button
                slot="end"
                fill="clear"
                color="danger"
                @click="deleteStudent(student.id)"
              >
                Delete
              </ion-button>
            </ion-item>
          </ion-list>

        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonList,
  IonLabel,
  alertController
} from '@ionic/vue';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';

import { db } from '@/firebase';

// Student interface
interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
}

// Form fields
const studentName = ref('');
const email = ref('');
const course = ref('');

const students = ref<Student[]>([]);
const isEditing = ref(false);
const editingId = ref('');
const loading = ref(false);

// Firestore collection
const studentsCollection = collection(db, 'students');

// READ - Get real-time student records
let unsubscribe: (() => void) | undefined;

onMounted(() => {
  loading.value = true;

  unsubscribe = onSnapshot(
    studentsCollection,
    (snapshot) => {
      students.value = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      } as Student));

      loading.value = false;
    },
    (error) => {
      console.error('Error fetching students:', error);
      loading.value = false;
    }
  );
});

onUnmounted(() => {
  unsubscribe?.();
});

// CLEAR FORM
function clearForm() {
  studentName.value = '';
  email.value = '';
  course.value = '';
  editingId.value = '';
  isEditing.value = false;
}

// CREATE AND UPDATE
async function saveStudent() {
  if (
    !studentName.value.trim() ||
    !email.value.trim() ||
    !course.value.trim()
  ) {
    const alert = await alertController.create({
      header: 'Required Fields',
      message: 'Please complete all fields.',
      buttons: ['OK']
    });

    await alert.present();
    return;
  }

  loading.value = true;

  try {
    const studentData = {
      name: studentName.value.trim(),
      email: email.value.trim(),
      course: course.value.trim()
    };

    if (isEditing.value) {
      // UPDATE
      await updateDoc(
        doc(db, 'students', editingId.value),
        studentData
      );

      await showMessage(
        'Success',
        'Student record updated successfully!'
      );

    } else {
      // CREATE
      await addDoc(studentsCollection, studentData);

      await showMessage(
        'Success',
        'Student record added successfully!'
      );
    }

    clearForm();

  } catch (error) {
    console.error('Error saving student:', error);
    await showMessage('Error', 'Unable to save student record.');
  } finally {
    loading.value = false;
  }
}

// EDIT - Load selected student
function editStudent(student: Student) {
  studentName.value = student.name;
  email.value = student.email;
  course.value = student.course;

  editingId.value = student.id;
  isEditing.value = true;
}

// DELETE
async function deleteStudent(id: string) {
  const alert = await alertController.create({
    header: 'Delete Student',
    message: 'Are you sure you want to delete this record?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          try {
            await deleteDoc(doc(db, 'students', id));

            await showMessage(
              'Deleted',
              'Student record deleted successfully!'
            );

            if (editingId.value === id) {
              clearForm();
            }

          } catch (error) {
            console.error('Error deleting student:', error);
            await showMessage('Error', 'Unable to delete student.');
          }
        }
      }
    ]
  });

  await alert.present();
}

// ALERT MESSAGE
async function showMessage(
  header: string,
  message: string
) {
  const alert = await alertController.create({
    header,
    message,
    buttons: ['OK']
  });

  await alert.present();
}
</script>
