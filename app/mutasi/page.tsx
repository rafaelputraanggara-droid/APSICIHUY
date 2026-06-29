"use client";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);


import React, { useState, useEffect, useRef } from "react";
import TableSkeleton from '@/components/TableSkeleton';

export default function MutasiPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [mutasiData, setMutasiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<string[]>([]);

  // Form State untuk Pengajuan Baru
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  const [part4, setPart4] = useState('');
  const [part5, setPart5] = useState('');
  const [nup, setNup] = useState('');
  const [foundItem, setFoundItem] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [ruanganTujuan, setRuanganTujuan] = useState("");
  const [alasanMutasi, setAlasanMutasi] = useState("");
          </div>

          {/* Add custom keyframes for the scanner line */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}
