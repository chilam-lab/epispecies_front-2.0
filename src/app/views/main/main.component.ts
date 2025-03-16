import { Component, ViewChild, ElementRef } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';

@Component({
  selector: 'app-main',
  imports: [MapComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  showAndScrollToMap() {
    this.mapContainer.nativeElement.classList.add('visible');
    
    setTimeout(() => {
      this.mapContainer.nativeElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 700); // Small delay to allow the container to start becoming visible
  } 
}
