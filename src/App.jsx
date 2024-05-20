import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Select,
  SkeletonText,
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";

import {
  useJsApiLoader,
  GoogleMap,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { getHistory, getRealtime } from "./services/api";
import data from "./realtime.json";

const center = { lat: 15.84021, lng: 108.39215 };

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBgV9y5hzu6NpDKB9WJd-F153GWecpqLCM", // Config to env
    libraries: ["places"],
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [startToEndPoint, setStartToEndPoint] = useState(null);
  const [realtimeToWaypoints, setRealtimeToWaypoints] = useState(null);
  const [histories, setHistories] = useState([]);
  const [realtime, setRealtime] = useState([]);

  const startPoint = { lat: 15.8321, lng: 108.40635 }; // Hoiana

  // Prepare bus stops - Fake datas
  const busStops = [
    // {
    //   lat: 16.02363,
    //   lng: 108.25061,
    // },
    {
      location:
        "Bệnh Viện Phụ Sản - Nhi Đà Nẵng, Đường Lê Văn Hiến, Khuê Mỹ, Ngũ Hành Sơn, Da Nang, Vietnam",
    },
    {
      location:
        "Trường Đại học Kiến trúc Đà Nẵng, Núi Thành, Hòa Cường, Hòa Cường Nam, Hải Châu District, Da Nang, Vietnam",
    },
  ];

  // Get current location from api realtime - useEffect
  const currentLocation = data.result.map((item) => ({
    lat: item.lat,
    lng: item.lng,
  }));

  // Fake end point - Benh vien C17
  const endPoint = { lat: 16.05448, lng: 108.20836 };

  // Call api history
  useEffect(() => {
    const fetchHistories = async () => {
      const data = await getHistory();
      setHistories(data);
    };

    fetchHistories();
  }, []);

  useEffect(() => {
    const fetchRealtime = async () => {
      const data = await getRealtime();
      setRealtime(data);
    };

    fetchRealtime();
  }, []);

  if (!isLoaded) {
    return <SkeletonText />;
  }

  // Calculate route
  const handleCalculateAndDisplayRoute = async () => {
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const startToEndPoint = await directionsService.route({
      origin: startPoint, // Start point
      waypoints: busStops,
      destination: endPoint, // End point
      optimizeWaypoints: true,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });

    const realtimeToWaypoints = await directionsService.route({
      origin: currentLocation[0], // Start point - realtime
      waypoints: busStops,
      destination: endPoint, // End point
      // optimizeWaypoints: true,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });

    // Start point
    new google.maps.Marker({
      position: startPoint,
      map,
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", // Replace with your icon path
    });

    // Realtime point
    new google.maps.Marker({
      position: currentLocation[0],
      map,
      icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Replace with your icon path
    });

    // Bus stops
    busStops.forEach((busStop) => {
      new google.maps.Marker({
        position: busStop,
        map,
        icon: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png", // Replace with your icon path
      });
    });

    // End point
    new google.maps.Marker({
      position: endPoint,
      map,
      icon: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png", // Replace with your icon path
    });

    setStartToEndPoint(startToEndPoint);
    setRealtimeToWaypoints(realtimeToWaypoints);
  };

  const handleClearRoute = () => {
    setRealtimeToWaypoints(null);
    setStartToEndPoint(null);
  };

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="start"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={13}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          {realtimeToWaypoints && (
            <DirectionsRenderer
              directions={realtimeToWaypoints}
              options={{ suppressMarkers: true }}
            />
          )}
          {startToEndPoint && ( // Draw path from start to end
            <DirectionsRenderer
              directions={startToEndPoint}
              options={{ suppressMarkers: true }}
            />
          )}
        </GoogleMap>
      </Box>
      <Box
        justifyContent={"flex-start"}
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.sm"
        zIndex="1"
      >
        <Select placeholder="Choose route" mb={15}>
          <option value="hoianaToDaNang">Hoiana - San Bay Da Nang</option>
          <option value="hoianaToTamKy">Hoiana - Tam Ky</option>
          <option value="hoianaToHoiAn">Hoiana - Hoi An</option>
        </Select>
        <HStack spacing={2} justifyContent="space-between">
          <Box>
            <p>List of bus stops:</p>
            {busStops.map((busStop, index) => (
              <li key={index} value={busStop.location}>
                {realtimeToWaypoints?.routes[0].legs[index].end_address}:{" "}
                {realtimeToWaypoints?.routes[0].legs[index].distance.text} - 
                {realtimeToWaypoints?.routes[0].legs[index].duration.text}
              </li>
            ))}
          </Box>
          <ButtonGroup>
            <Button
              colorScheme="blue"
              type="submit"
              onClick={handleCalculateAndDisplayRoute}
            >
              Calculate Route
            </Button>
            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={handleClearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <IconButton
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(currentLocation[0]);
              map.setZoom(14);
            }}
          />
        </HStack>
      </Box>
    </Flex>
  );
}

export default App;
