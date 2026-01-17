
import Swal from 'sweetalert2';


export const NOTIFICATION_MESSAGES = {
  DATA_LOADED: 'Datos cargados correctamente.',
  DATA_SAVED: 'Datos guardados correctamente.',
  DATA_DELETED: 'Datos eliminados correctamente.',
  ERROR_LOADING: 'Error al cargar los datos.',
  LOADING_DATA: 'Cargando datos...',

  SELECT_FIRST_CLASS: 'Por favor seleccione una enfermedad',

  STATE_SELECTED: 'Estado seleccionado correctamente.',
  WRONG_STATE: 'Por favor seleccione un estado valido',
  MUNICIPAL_SELECTED: 'Municipio seleccionado correctamente.',
  WRONG_MUNICIPAL: 'Por favor seleccione un municipio valido',


  SELECT_CATEGORY: 'Por favor seleccione una categoría'
};

export const showNotification = {
  success: (message: string, timer: number = 1500) => {
    Swal.fire({
      timer,
      title: message,
      icon: 'success',
      showConfirmButton: false
    });
  },

  error: (message: string, timer: number = 1500) => {
    Swal.fire({
      timer,
      title: message,
      icon: 'error',
      showConfirmButton: false
    });
  },

  warning: (message: string, timer: number = 1500) => {
    Swal.fire({
      timer,
      title: message,
      icon: 'warning',
      showConfirmButton: false
    });
  },

  info: (message: string, timer: number = 1100) => {
    Swal.fire({
      timer,
      title: message,
      icon: 'info',
      showConfirmButton: false
    });
  },

  confirm: async (message: string, confirmText: string = 'Sí, confirmar') => {
    return await Swal.fire({
      title: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar'
    });
  },

  loading: (message: string = 'Cargando datos...') => {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  close: () => {
    Swal.close();
  }
};


export const sideNotification = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const showToast = {
  success: (message: string, timer: number = 2000) => {
    sideNotification.fire({
      icon: "success",
      title: message,
      timer
    });
  },

  error: (message: string, timer: number = 2000) => {
    sideNotification.fire({
      icon: "error",
      title: message,
      timer
    });
  },

  warning: (message: string, timer: number = 2000) => {
    sideNotification.fire({
      icon: "warning",
      title: message,
      timer
    });
  },

  info: (message: string, timer: number = 2000) => {
    sideNotification.fire({
      icon: "info",
      title: message,
      timer
    });
  }
};
