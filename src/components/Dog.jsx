import React, { useEffect, useRef } from 'react'
import * as THREE from "three"
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture, useAnimations } from '@react-three/drei'
import gsap from "gsap";
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


const Dog = () => {


    gsap.registerPlugin(useGSAP())
    gsap.registerPlugin(ScrollTrigger)


    const BASE = import.meta.env.BASE_URL;

    const model = useGLTF(`${BASE}models/dog.drc.glb`)

    const { size } = useThree()
    const isMobile = size.width < 768
    const isTablet = size.width >= 768 && size.width < 1024

    useThree(({ camera, gl }) => {
        const aspect = size.width / size.height
        if (isMobile) {
            camera.position.z = Math.max(0.65, 0.65 * (1 / Math.max(aspect, 0.45)) * 0.6)
        } else if (isTablet) {
            camera.position.z = 0.6
        } else {
            camera.position.z = 0.55
        }
        camera.updateProjectionMatrix()
        gl.toneMapping = THREE.ReinhardToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
    })

    const { actions } = useAnimations(model.animations, model.scene)

    useEffect(() => {
        actions[ "Take 001" ]?.play()
    }, [ actions ])



    const [ normalMap ] = (useTexture([ `${BASE}dog_normals.jpg`, ]))
        .map(texture => {
            texture.flipY = false
            texture.colorSpace = THREE.SRGBColorSpace
            return texture
        })

    const [ branchMap, branchNormalMap ] = (useTexture([ `${BASE}branches_diffuse.jpeg`, `${BASE}branches_normals.jpeg` ]))
        .map(texture => {
            texture.colorSpace = THREE.SRGBColorSpace
            return texture
        })

    const [
        mat1,
        mat2,
        mat3,
        mat4,
        mat5,
        mat6,
        mat7,
        mat8,
        mat9,
        mat10,
        mat11,
        mat12,
        mat13,
        mat14,
        mat15,
        mat16,
        mat17,
        mat18,
        mat19,
        mat20
    ] = (useTexture([
        `${BASE}matcap/mat-1.png`,
        `${BASE}matcap/mat-2.png`,
        `${BASE}matcap/mat-3.png`,
        `${BASE}matcap/mat-4.png`,
        `${BASE}matcap/mat-5.png`,
        `${BASE}matcap/mat-6.png`,
        `${BASE}matcap/mat-7.png`,
        `${BASE}matcap/mat-8.png`,
        `${BASE}matcap/mat-9.png`,
        `${BASE}matcap/mat-10.png`,
        `${BASE}matcap/mat-11.png`,
        `${BASE}matcap/mat-12.png`,
        `${BASE}matcap/mat-13.png`,
        `${BASE}matcap/mat-14.png`,
        `${BASE}matcap/mat-15.png`,
        `${BASE}matcap/mat-16.png`,
        `${BASE}matcap/mat-17.png`,
        `${BASE}matcap/mat-18.png`,
        `${BASE}matcap/mat-19.png`,
        `${BASE}matcap/mat-20.png`,
    ])).map(texture => {
        texture.colorSpace = THREE.SRGBColorSpace
        return texture
    })

    const material = useRef({
        uMatcap1: { value: mat19 },
        uMatcap2: { value: mat2 },
        uProgress: { value: 1.0 }
    })

    const dogMaterial = new THREE.MeshMatcapMaterial({
        normalMap: normalMap,
        matcap: mat2
    })

    const branchMaterial = new THREE.MeshMatcapMaterial({
        normalMap: branchNormalMap,
        map: branchMap
    })

    function onBeforeCompile(shader) {
        shader.uniforms.uMatcapTexture1 = material.current.uMatcap1
        shader.uniforms.uMatcapTexture2 = material.current.uMatcap2
        shader.uniforms.uProgress = material.current.uProgress

        // Store reference to shader uniforms for GSAP animation

        shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `
        )

        shader.fragmentShader = shader.fragmentShader.replace(
            "vec4 matcapColor = texture2D( matcap, uv );",
            `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `
        )
    }

    dogMaterial.onBeforeCompile = onBeforeCompile

    model.scene.traverse((child) => {
        if (child.name.includes("DOG")) {
            child.material = dogMaterial
        } else {
            child.material = branchMaterial
        }
    })

    const dogModel = useRef(model)

    useGSAP(() => {
        const mm = gsap.matchMedia()

        // Desktop & Tablet Landscape
        mm.add("(min-width: 768px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#section-1",
                    endTrigger: "#section-3",
                    start: "top top",
                    end: "bottom bottom",
                    markers: false,
                    scrub: true
                }
            })

            tl
                .to(dogModel.current.scene.position, {
                    z: "-=0.75",
                    y: "+=0.1"
                })
                .to(dogModel.current.scene.rotation, {
                    x: `+=${Math.PI / 15}`
                })
                .to(dogModel.current.scene.rotation, {
                    y: `-=${Math.PI}`,
                }, "third")
                .to(dogModel.current.scene.position, {
                    x: "-=0.5",
                    z: "+=0.6",
                    y: "-=0.05"
                }, "third")
        })

        // Mobile (Portrait / small screens)
        mm.add("(max-width: 767px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#section-1",
                    endTrigger: "#section-3",
                    start: "top top",
                    end: "bottom bottom",
                    markers: false,
                    scrub: true
                }
            })

            tl
                .to(dogModel.current.scene.position, {
                    z: "-=0.45",
                    y: "+=0.05"
                })
                .to(dogModel.current.scene.rotation, {
                    x: `+=${Math.PI / 15}`
                })
                .to(dogModel.current.scene.rotation, {
                    y: `-=${Math.PI}`,
                }, "third")
                .to(dogModel.current.scene.position, {
                    x: "-=0.15",
                    z: "+=0.35",
                    y: "-=0.03"
                }, "third")
        })

        return () => mm.revert()
    }, [size.width])

    useEffect(() => {
        const applyMatcap = (targetMat) => {
            material.current.uMatcap1.value = targetMat
            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.35,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        }

        const projectItems = [
            { key: "tomorrowland", mat: mat19 },
            { key: "navy-pier", mat: mat8 },
            { key: "msi-chicago", mat: mat9 },
            { key: "phone", mat: mat12 },
            { key: "kikk", mat: mat10 },
            { key: "kennedy", mat: mat8 },
            { key: "opera", mat: mat13 },
        ]

        const cleanups = []

        const setActiveItem = (el, mat) => {
            document.querySelectorAll(".title").forEach(t => t.classList.remove("active"))
            if (el) el.classList.add("active")
            applyMatcap(mat)
        }

        projectItems.forEach(({ key, mat }) => {
            const el = document.querySelector(`.title[img-title="${key}"]`)
            if (!el) return

            const onEnter = () => setActiveItem(el, mat)
            const onClick = (e) => {
                e.stopPropagation()
                setActiveItem(el, mat)
            }

            el.addEventListener("mouseenter", onEnter)
            el.addEventListener("click", onClick)
            cleanups.push(() => {
                el.removeEventListener("mouseenter", onEnter)
                el.removeEventListener("click", onClick)
            })
        })

        const titlesContainer = document.querySelector(".titles")
        if (titlesContainer) {
            const onLeave = () => {
                document.querySelectorAll(".title").forEach(t => t.classList.remove("active"))
                applyMatcap(mat2)
            }
            titlesContainer.addEventListener("mouseleave", onLeave)
            cleanups.push(() => titlesContainer.removeEventListener("mouseleave", onLeave))
        }

        const onDocClick = (e) => {
            if (!e.target.closest(".title")) {
                document.querySelectorAll(".title").forEach(t => t.classList.remove("active"))
                applyMatcap(mat2)
            }
        }
        document.addEventListener("click", onDocClick)
        cleanups.push(() => document.removeEventListener("click", onDocClick))

        return () => {
            cleanups.forEach(fn => fn())
        }
    }, [mat19, mat8, mat9, mat12, mat10, mat13, mat2])

    const initialPos = isMobile ? [ 0, -0.42, 0 ] : (isTablet ? [ 0.15, -0.5, 0 ] : [ 0.25, -0.55, 0 ])
    const scale = isMobile ? 0.8 : (isTablet ? 0.9 : 1)

    return (
        <>
            <primitive object={model.scene} position={initialPos} scale={scale} rotation={[ 0, Math.PI / 3.9, 0 ]} />
            <directionalLight position={[ 0, 5, 5 ]} color={0xFFFFFF} intensity={10} />
        </>
    )
}

export default Dog