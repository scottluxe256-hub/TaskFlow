import Swal from 'sweetalert2';

export const showDeleteConfirm = (
  title: string,
  onConfirm: () => void | Promise<void>,
  isDarkMode: boolean = false
) => {
  Swal.fire({
    title: 'Hapus Tugas?',
    text: `Tugas "${title}" akan dihapus permanen dan tidak bisa dikembalikan.`,
    icon: 'warning',
    iconColor: '#f43f5e',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    background: isDarkMode ? '#0f172a' : '#ffffff',
    color: isDarkMode ? '#f8fafc' : '#0f172a',
    customClass: {
      popup: 'rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl',
      confirmButton: 'px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer transition mx-1',
      cancelButton: isDarkMode 
        ? 'px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition mx-1'
        : 'px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer transition mx-1'
    },
    buttonsStyling: false
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};

export const showAccountDeleteConfirm = (
  onConfirm: () => void | Promise<void>,
  isDarkMode: boolean = false
) => {
  Swal.fire({
    title: 'Tunggu Dulu! 🚨',
    text: 'Apakah Anda yakin ingin menghapus akun ini secara permanen? Semua data tugas, profil, dan XP akan hangus dan tidak bisa dikembalikan.',
    icon: 'warning',
    iconColor: '#f43f5e', 
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus Akun!',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    background: isDarkMode ? '#0f172a' : '#ffffff',
    color: isDarkMode ? '#f8fafc' : '#0f172a',
    customClass: {
      popup: 'rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl',
      confirmButton: 'px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer transition mx-1',
      cancelButton: isDarkMode 
        ? 'px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition mx-1'
        : 'px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer transition mx-1'
    },
    buttonsStyling: false
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};

export const showSuccessAlert = (
  title: string,
  text: string,
  isDarkMode: boolean = false
) => {
  Swal.fire({
    title,
    text,
    icon: 'success',
    iconColor: '#8b5cf6',
    background: isDarkMode ? '#0f172a' : '#ffffff',
    color: isDarkMode ? '#f8fafc' : '#0f172a',
    confirmButtonText: 'Mantap!',
    customClass: {
      popup: 'rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl',
      confirmButton: 'px-5 py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer transition mx-1',
    },
    buttonsStyling: false
  });
};
